import { test, expect, type APIRequestContext } from "@playwright/test";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomUUID, createHmac, createHash } from "node:crypto";
import sharp from "sharp";
const enabled = process.env.BLOG_E2E === "true";
test.skip(
  !enabled,
  "Requires isolated demo Firebase emulators; see blog runbook.",
);
const origin = process.env.BLOG_TEST_ORIGIN ?? "http://localhost:3107";
const headers = { origin, "x-blog-request": "1" };
// Repeatable local fixtures: reset only the shared synthetic action buckets.
// Production limiter behavior is unchanged and is asserted below.
test.beforeEach(async () => {
  if (!enabled) return;
  if (
    !((process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:18080" &&
       process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:19099") ||
      (process.env.BLOG_RELEASE_EMULATORS === "true" &&
       process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:28080" &&
       process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:29099"))
  )
    throw new Error("Refuse non-demo fixture reset");
  const a =
    getApps().find((a) => a.name === "blog-rate-fixture") ??
    initializeApp(
      { projectId: "demo-hunpeolabs-blog-001" },
      "blog-rate-fixture",
    );
  const db = getFirestore(a);
  const hash = (s: string) =>
    createHmac("sha256", "emulator-only").update(s).digest("hex");
  const batch = db.batch();
  for (const action of ["comment", "session", "report"])
    batch.delete(
      db
        .collection("blogRateLimits")
        .doc(
          hash(
            `${action}:global:${Math.floor(Date.now() / 3600000)}`,
          ),
        ),
    );
  await batch.commit();
});

async function login(r: APIRequestContext, email: string) {
  const credential = [
    Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: email,
        email,
        email_verified: true,
        name: "Demo Reader",
      }),
    ).toString("base64url"),
    "",
  ].join(".");
  const res = await r.post(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-key`,
    {
      data: {
        requestUri: origin,
        postBody: new URLSearchParams({
          id_token: credential,
          providerId: "google.com",
        }).toString(),
        returnSecureToken: true,
      },
    },
  );
  expect(res.ok()).toBe(true);
  const body = await res.json();
  const session = await r.post(`${origin}/api/blog/session`, {
    headers,
    data: { idToken: body.idToken },
  });
  expect(await session.text()).toContain("ok");
}
const grantId = (email: string) =>
  createHash("sha256").update(email.toLowerCase()).digest("hex");
async function grant(
  db: ReturnType<typeof getFirestore>,
  user: { uid: string; email?: string },
  role: string,
) {
  await db
    .collection("blogAccess")
    .doc(grantId(user.email!))
    .set({
      email: user.email!.toLowerCase(),
      uid: user.uid,
      role,
      active: role !== "reader",
      name: "Demo Editor",
    });
}

test("complete CMS, media, moderation, concurrency and anonymous publication boundary", async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  if (
    !process.env.FIRESTORE_EMULATOR_HOST ||
    !process.env.FIREBASE_AUTH_EMULATOR_HOST
  )
    throw new Error("Emulator hosts required");
  const project = "demo-hunpeolabs-blog-001";
  const app =
    getApps().find((a) => a.name === "blog-e2e") ??
    initializeApp({ projectId: project }, "blog-e2e");
  const auth = getAuth(app);
  const db = getFirestore(app);
  const key = randomUUID().slice(0, 8);
  const email = `editor-${key}@example.test`;
  const readerEmail = `reader-${key}@example.test`;
  const owner = await auth.createUser({
    email,
    password: "Local-Only-Test-Password-001!",
    emailVerified: true,
    displayName: "Demo Editor",
  });
  const reader = await auth.createUser({
    email: readerEmail,
    password: "Local-Only-Test-Password-001!",
    emailVerified: true,
    displayName: "Demo Reader",
  });
  await grant(db, owner, "admin");
  await db
    .collection("blogAuthors")
    .doc(`writer-${key}`)
    .set({ name: "Demo Author — local test" });
  await login(page.request, email);
  await page.goto(`${origin}/admin/blog`);
  await expect(page).toHaveURL(/\/admin\/blog$/);
  console.info("Blog E2E: signed in");
  await page.getByRole("button", { name: "Viết bài mới" }).click();
  await expect(page).toHaveURL(/\/admin\/blog\/[a-zA-Z0-9]+$/);
  const id = page.url().split("/").pop()!;
  console.info("Blog E2E: draft created");
  await page.getByLabel("Tiêu đề", { exact: true }).fill(`Local test ${key}`);
  await page
    .getByLabel("Tóm tắt", { exact: true })
    .fill("Bài kiểm thử tổng hợp, không phải nội dung xuất bản thực.");
  await page.getByLabel("Slug", { exact: true }).fill(`local-${key}`);
  await page
    .getByLabel("Tác giả", { exact: true })
    .selectOption(`writer-${key}`);
  await page.locator(".tiptap").fill("Nội dung bài kiểm thử với tiếng Việt.");
  await page
    .getByLabel("Nguồn tham khảo", { exact: false })
    .fill("Primary source | https://example.com/reference");
  await page.getByRole("button", { name: "Lưu bản nháp", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu.");
  console.info("Blog E2E: draft saved");
  const anonymous = await browser.newContext({
    viewport: page.viewportSize() ?? undefined,
  });
  const visitor = await anonymous.newPage();
  expect(
    (
      await visitor.request.get(`${origin}/resources/blog/local-${key}`)
    ).status(),
  ).toBe(404);
  expect(
    (
      await visitor.request.get(`${origin}/api/admin/blog/posts/${id}`)
    ).status(),
  ).toBe(401);
  const image = await sharp({
    create: { width: 64, height: 32, channels: 3, background: "#2443ee" },
  })
    .png()
    .toBuffer();
  const uploaded = await page.request.post(
    `${origin}/api/admin/blog/media?postId=${id}`,
    { headers: { ...headers, "Content-Type": "image/png" }, data: image },
  );
  expect(uploaded.ok()).toBe(true);
  const media = await uploaded.json();
  const avatarResponse = await page.request.post(
    `${origin}/api/admin/blog/media?authorId=writer-${key}`,
    { headers: { ...headers, "Content-Type": "image/png" }, data: image },
  );
  expect(avatarResponse.ok()).toBe(true);
  const avatar = await avatarResponse.json();
  const authorUpdate = await page.request.post(
    `${origin}/api/admin/blog/authors`,
    {
      headers,
      data: {
        id: `writer-${key}`,
        name: "Demo Author — local test",
        bio: "Local verified author biography.",
      },
    },
  );
  expect(authorUpdate.ok()).toBe(true);
  expect(
    (await db.collection("blogAuthors").doc(`writer-${key}`).get()).get(
      "avatarId",
    ),
  ).toBe(avatar.id);
  expect(
    (
      await page.request.post(`${origin}/api/admin/blog/members`, {
        headers,
        data: { email: readerEmail, role: "reader" },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await page.request.post(`${origin}/api/admin/blog/members`, {
        headers,
        data: { email, role: "reader" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.post(`${origin}/api/admin/blog/members`, {
        headers,
        data: { email: `missing-${key}@example.test`, role: "author" },
      })
    ).status(),
  ).toBe(200);
  expect((await visitor.request.get(`${origin}${avatar.url}`)).status()).toBe(
    404,
  );

  expect((await visitor.request.get(`${origin}${media.url}`)).status()).toBe(
    404,
  );
  let draft = await (
    await page.request.get(`${origin}/api/admin/blog/posts/${id}`)
  ).json();
  const save = await page.request.put(`${origin}/api/admin/blog/posts/${id}`, {
    headers,
    data: { draft: { ...draft, coverId: media.id }, revision: draft.revision },
  });
  expect(save.ok()).toBe(true);
  draft = await save.json();
  const operationId = randomUUID();
  const published = await page.request.post(
    `${origin}/api/admin/blog/posts/${id}/publish`,
    { headers, data: { revision: draft.revision, operationId } },
  );
  expect(await published.text()).toContain("ok");
  expect(
    (
      await page.request.post(`${origin}/api/admin/blog/posts/${id}/publish`, {
        headers,
        data: { revision: draft.revision, operationId },
      })
    ).ok(),
  ).toBe(true);
  await visitor.goto(`${origin}/resources/blog/local-${key}`);
  await expect(
    visitor.getByText("Local verified author biography."),
  ).toBeVisible();
  await expect(
    visitor.getByRole("heading", { name: `Local test ${key}`, exact: true }),
  ).toBeVisible();
  await visitor
    .getByRole("button", { name: "Share", exact: true })
    .first()
    .click();
  await visitor
    .getByRole("button", { name: "Copy link", exact: true })
    .first()
    .click();
  await expect(visitor.getByRole("dialog").getByRole("status")).toContainText(
    /copied|copy/i,
  );
  await visitor.getByRole("button", { name: "Close", exact: true }).click();
  expect((await visitor.request.get(`${origin}${media.url}`)).status()).toBe(
    200,
  );
  expect((await visitor.request.get(`${origin}${avatar.url}`)).status()).toBe(
    200,
  );
  const privateUpdate = await page.request.put(
    `${origin}/api/admin/blog/posts/${id}`,
    {
      headers,
      data: {
        draft: { ...draft, title: "SECRET DRAFT TITLE" },
        revision: draft.revision,
      },
    },
  );
  expect(privateUpdate.ok()).toBe(true);
  const newDraft = await privateUpdate.json();
  expect(
    (
      await page.request.put(`${origin}/api/admin/blog/posts/${id}`, {
        headers,
        data: { draft, revision: draft.revision },
      })
    ).status(),
  ).toBe(409);
  expect(
    await (
      await visitor.request.get(`${origin}/resources/blog/local-${key}`)
    ).text(),
  ).not.toContain("SECRET DRAFT TITLE");
  await login(visitor.request, readerEmail);
  expect(
    (
      await visitor.request.post(
        `${origin}/api/admin/blog/media?authorId=writer-${key}`,
        { headers: { ...headers, "Content-Type": "image/png" }, data: image },
      )
    ).status(),
  ).toBe(403);
  const comment = await visitor.request.post(`${origin}/api/blog/comments`, {
    headers,
    data: {
      postId: id,
      text: "A thoughtful local test comment",
      operationId: randomUUID(),
    },
  });
  expect(comment.ok()).toBe(true);
  const own = await (
    await visitor.request.get(`${origin}/api/blog/comments?postId=${id}&mine=1`)
  ).json();
  const cid = own[0].id;
  expect(
    (
      await (
        await page.request.get(`${origin}/api/blog/comments?postId=${id}`)
      ).json()
    ).items,
  ).toHaveLength(0);
  expect(
    (
      await visitor.request.post(
        `${origin}/api/admin/blog/comments/${cid}/moderate`,
        { headers, data: { action: "approved", revision: 1 } },
      )
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post(
        `${origin}/api/admin/blog/comments/${cid}/moderate`,
        {
          headers: { "x-blog-request": "1", origin: "https://evil.example" },
          data: { action: "approved", revision: 1 },
        },
      )
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post(
        `${origin}/api/admin/blog/comments/${cid}/moderate`,
        { headers, data: { action: "approved", revision: 1 } },
      )
    ).ok(),
  ).toBe(true);
  await visitor.reload();
  await expect(
    visitor
      .locator(".comment")
      .getByText("A thoughtful local test comment")
      .first(),
  ).toBeVisible();
  const comments = await (
    await visitor.request.get(`${origin}/api/blog/comments?postId=${id}`)
  ).json();
  expect(JSON.stringify(comments)).not.toContain(reader.uid);
  expect(JSON.stringify(comments)).not.toContain(readerEmail);
  await page.goto(`${origin}/admin/blog/comments`);
  await page.screenshot({
    path: `/tmp/hunpeo-blog-moderation-${test.info().project.name}.png`,
    fullPage: true,
  });
  await visitor.screenshot({
    path: `/tmp/hunpeo-blog-article-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(
    (
      await page.request.post(
        `${origin}/api/admin/blog/posts/${id}/unpublish`,
        { headers, data: { revision: newDraft.revision } },
      )
    ).ok(),
  ).toBe(true);
  expect(
    (
      await visitor.request.get(`${origin}/resources/blog/local-${key}`)
    ).status(),
  ).toBe(404);
  expect((await visitor.request.get(`${origin}${media.url}`)).status()).toBe(
    404,
  );

  expect((await visitor.request.get(`${origin}${avatar.url}`)).status()).toBe(
    404,
  );
  expect(
    (
      await visitor.request.get(`${origin}/api/blog/comments?postId=${id}`)
    ).status(),
  ).toBe(404);
  expect(
    await (
      await visitor.request.get(`${origin}/resources/blog/feed.xml`)
    ).text(),
  ).not.toContain(`local-${key}`);
  const denied = await visitor.request.get(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${project}/databases/(default)/documents/blogPosts/${id}`,
  );
  expect(denied.status()).toBe(403);
  await anonymous.close();
});

test("comment threads, private projections, conflicting writes and revoked access", async ({
  browser,
}) => {
  test.setTimeout(180000);
  const project = "demo-hunpeolabs-blog-001";
  const app =
    getApps().find((a) => a.name === "blog-e2e") ??
    initializeApp({ projectId: project }, "blog-e2e");
  const auth = getAuth(app);
  const db = getFirestore(app);
  const key = randomUUID().slice(0, 8);
  const owner = await auth.createUser({
    email: `owner-${key}@example.test`,
    password: "Local-Only-Test-Password-001!",
    emailVerified: true,
    displayName: "Local Moderator",
  });
  const reader = await auth.createUser({
    email: `member-${key}@example.test`,
    password: "Local-Only-Test-Password-001!",
    emailVerified: true,
    displayName: "Local Reader",
  });
  const stranger = await auth.createUser({
    email: `other-${key}@example.test`,
    password: "Local-Only-Test-Password-001!",
    emailVerified: true,
    displayName: "Other Reader",
  });
  await grant(db, owner, "admin");
  await db
    .collection("blogAuthors")
    .doc(key)
    .set({ name: "Local Test Author" });
  const admin = await browser.newContext();
  const user = await browser.newContext();
  const other = await browser.newContext();
  const anon = await browser.newContext();
  await login(admin.request, owner.email!);
  await login(user.request, reader.email!);
  await login(other.request, stranger.email!);
  const post = await (
    await admin.request.post(`${origin}/api/admin/blog/posts`, { headers })
  ).json();
  const payload = {
    ...post,
    title: `Thread fixture ${key}`,
    slug: `thread-${key}`,
    summary: "Local fixture only",
    authorId: key,
    sources: [{ title: "Reference", url: "https://example.com" }],
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Local test manuscript" }],
        },
      ],
    },
  };
  const saved = await (
    await admin.request.put(`${origin}/api/admin/blog/posts/${post.id}`, {
      headers,
      data: { revision: post.revision, draft: payload },
    })
  ).json();
  expect(saved.revision).toBe(2);
  expect(
    (
      await admin.request.put(`${origin}/api/admin/blog/posts/${post.id}`, {
        headers,
        data: {
          revision: 2,
          draft: {
            ...payload,
            body: {
              type: "doc",
              content: [{ type: "script", text: "alert(1)" }],
            },
          },
        },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await admin.request.post(
        `${origin}/api/admin/blog/posts/${post.id}/publish`,
        { headers, data: { revision: 2, operationId: randomUUID() } },
      )
    ).ok(),
  ).toBe(true);
  const send = async (parentId = "") => {
    const operationId = randomUUID();
    const res = await user.request.post(`${origin}/api/blog/comments`, {
      headers,
      data: {
        postId: post.id,
        parentId,
        text: parentId ? "Reply text" : "Parent text",
        operationId,
      },
    });
    expect(res.ok()).toBe(true);
    const again = await user.request.post(`${origin}/api/blog/comments`, {
      headers,
      data: { postId: post.id, parentId, text: "Retry body", operationId },
    });
    expect(again.ok()).toBe(true);
    const list = await (
      await user.request.get(
        `${origin}/api/blog/comments?postId=${post.id}&mine=1`,
      )
    ).json();
    return list.find((c: { parentId: string }) => c.parentId === parentId);
  };
  const moderate = async (
    id: string,
    revision: number,
    action = "approved",
  ) => {
    const res = await admin.request.post(
      `${origin}/api/admin/blog/comments/${id}/moderate`,
      { headers, data: { revision, action } },
    );
    expect(res.ok()).toBe(true);
  };
  const root = await send();
  await moderate(root.id, 1);
  const reply = await send(root.id);
  await moderate(reply.id, 1);
  let publicList = await (
    await anon.request.get(`${origin}/api/blog/comments?postId=${post.id}`)
  ).json();
  expect(publicList.count).toBe(2);
  expect(publicList.items).toHaveLength(1);
  expect(JSON.stringify(publicList)).not.toContain(reader.uid);
  expect(
    (
      await other.request.put(`${origin}/api/blog/comments/${root.id}`, {
        headers,
        data: { revision: 2, text: "Stolen edit" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await admin.request.post(
        `${origin}/api/admin/blog/comments/${root.id}/moderate`,
        { headers, data: { revision: 1, action: "hidden" } },
      )
    ).status(),
  ).toBe(409);
  expect(
    (
      await user.request.put(`${origin}/api/blog/comments/${root.id}`, {
        headers,
        data: { revision: 2, text: "Revised parent" },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await anon.request.get(
        `${origin}/api/blog/comments?postId=${post.id}&parentId=${root.id}`,
      )
    ).status(),
  ).toBe(404);
  publicList = await (
    await anon.request.get(`${origin}/api/blog/comments?postId=${post.id}`)
  ).json();
  expect(publicList.count).toBe(0);
  await moderate(root.id, 3);
  expect(
    (
      await user.request.delete(`${origin}/api/blog/comments/${root.id}`, {
        headers,
        data: { revision: 4 },
      })
    ).ok(),
  ).toBe(true);
  publicList = await (
    await anon.request.get(`${origin}/api/blog/comments?postId=${post.id}`)
  ).json();
  expect(publicList.count).toBe(1);
  expect(publicList.items[0].text).toBe("");
  expect(publicList.items[0].name).toBe("");
  expect(
    (
      await anon.request.get(
        `${origin}/api/blog/comments?postId=${post.id}&commentId=${reply.id}`,
      )
    ).ok(),
  ).toBe(true);
  await moderate(root.id, 5, "hidden");
  expect(
    (
      await anon.request.get(
        `${origin}/api/blog/comments?postId=${post.id}&commentId=${reply.id}`,
      )
    ).status(),
  ).toBe(404);
  const exportResponse = await admin.request.get(
    `${origin}/api/admin/blog/export`,
  );
  expect(exportResponse.ok()).toBe(true);
  expect(
    (await exportResponse.json()).blogPosts.some(
      (p: { id: string }) => p.id === post.id,
    ),
  ).toBe(true);
  // Two submissions, two idempotent retries and one edit used the five-write allowance.
  const limited = await user.request.post(`${origin}/api/blog/comments`, {
    headers,
    data: {
      postId: post.id,
      text: "Rate limit fixture six",
      operationId: randomUUID(),
    },
  });
  expect(limited.status()).toBe(429);
  await grant(db, owner, "reader");
  expect(
    (await admin.request.get(`${origin}/api/admin/blog/posts`)).status(),
  ).toBe(403);
  await grant(db, owner, "admin");
  expect(
    (
      await admin.request.post(
        `${origin}/api/admin/blog/posts/${post.id}/unpublish`,
        { headers, data: { revision: 2 } },
      )
    ).ok(),
  ).toBe(true);
  for (const c of [admin, user, other, anon]) await c.close();
});

test("approved editor design preserves offline work, publishes through confirmation and detects conflicts", async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  const app =
    getApps().find((a) => a.name === "blog-ui-story") ??
    initializeApp({ projectId: "demo-hunpeolabs-blog-001" }, "blog-ui-story");
  const db = getFirestore(app);
  const key = randomUUID().slice(0, 8);
  const email = `ui-${key}@example.test`;
  const owner = await getAuth(app).createUser({
    email,
    password: "Local-Only-Test-Password-001!",
    emailVerified: true,
    displayName: "UI Editor",
  });
  await grant(db, owner, "admin");
  await db.collection("blogAuthors").doc(key).set({ name: "UI Test Author" });
  await login(page.request, email);
  let p = await (
    await page.request.post(`${origin}/api/admin/blog/posts`, { headers })
  ).json();
  p = await (
    await page.request.put(`${origin}/api/admin/blog/posts/${p.id}`, {
      headers,
      data: {
        revision: p.revision,
        draft: {
          ...p,
          title: `UI story ${key}`,
          slug: `ui-story-${key}`,
          summary: "Synthetic local UI workflow",
          authorId: key,
          body: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Original manuscript." }],
              },
            ],
          },
          sources: [
            { title: "Reference", url: "https://example.com/reference" },
          ],
        },
      },
    })
  ).json();
  await page.goto(`${origin}/admin/blog/${p.id}`);
  await expect(page.locator(".tiptap")).toBeVisible();
  const saveRoute = `**/api/admin/blog/posts/${p.id}`;
  await page.route(saveRoute, (r) =>
    r.request().method() === "PUT"
      ? r.abort("internetdisconnected")
      : r.continue(),
  );
  await page
    .getByLabel("Tiêu đề", { exact: true })
    .fill(`Offline draft ${key}`);
  await page.getByRole("button", { name: "Lưu bản nháp", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Giữ trang này mở và thử lại",
  );
  await expect(page.getByLabel("Tiêu đề", { exact: true })).toHaveValue(
    `Offline draft ${key}`,
  );
  await page.unroute(saveRoute);
  await page.getByRole("button", { name: "Lưu bản nháp", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu.");
  await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
  await page
    .getByRole("button", { name: "Xuất bản ngay", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cập nhật", exact: true }),
  ).toBeVisible();
  const visitor = await browser.newContext();
  const published = await visitor.request.get(
    `${origin}/resources/blog/ui-story-${key}`,
  );
  expect(published.ok()).toBe(true);
  expect(await published.text()).toContain(`Offline draft ${key}`);
  const current = await (
    await page.request.get(`${origin}/api/admin/blog/posts/${p.id}`)
  ).json();
  expect(
    (
      await page.request.put(`${origin}/api/admin/blog/posts/${p.id}`, {
        headers,
        data: {
          revision: current.revision,
          draft: { ...current, title: `Another tab ${key}` },
        },
      })
    ).ok(),
  ).toBe(true);
  await page
    .getByLabel("Tiêu đề", { exact: true })
    .fill(`Unsaved local ${key}`);
  await page.getByRole("button", { name: "Lưu bản nháp", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("tab khác");
  await expect(page.getByLabel("Tiêu đề", { exact: true })).toHaveValue(
    `Unsaved local ${key}`,
  );
  expect(
    (
      await page.request.post(
        `${origin}/api/admin/blog/posts/${p.id}/unpublish`,
        { headers, data: { revision: current.revision + 1 } },
      )
    ).ok(),
  ).toBe(true);
  await visitor.close();
});

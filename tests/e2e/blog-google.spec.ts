import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { createHash, randomUUID, createHmac } from "node:crypto";
import sharp from "sharp";
const enabled = process.env.BLOG_E2E === "true";
test.skip(!enabled, "Explicit local Firebase emulators required");
const origin = process.env.BLOG_TEST_ORIGIN || "http://localhost:3107";
const headers = { origin, "x-blog-request": "1" };
const initial = ["hunpeo@gmail.com", "phamhung.pitit@gmail.com"];
const key = (email: string) =>
  createHash("sha256").update(email.toLowerCase()).digest("hex");
function fixture() {
  if (
    !((["127.0.0.1:18080", "127.0.0.1:18082"].includes(process.env.FIRESTORE_EMULATOR_HOST ?? "") &&
       process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:19099") ||
      (process.env.BLOG_RELEASE_EMULATORS === "true" &&
       process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:28080" &&
       process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:29099"))
  )
    throw Error("Refuse non-demo fixtures");
  return (
    getApps().find((a) => a.name === "google-e2e") ||
    initializeApp({ projectId: "demo-hunpeolabs-blog-001" }, "google-e2e")
  );
}
async function googleToken(
  r: APIRequestContext,
  email: string,
  verified = true,
) {
  const jwt = [
    Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: email,
        email,
        email_verified: verified,
        name: "Local Google Tester",
      }),
    ).toString("base64url"),
    "",
  ].join(".");
  const result = await r.post(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-key`,
    {
      data: {
        requestUri: origin,
        postBody: new URLSearchParams({
          id_token: jwt,
          providerId: "google.com",
        }).toString(),
        returnSecureToken: true,
      },
    },
  );
  expect(result.ok()).toBe(true);
  return result.json();
}
async function googleSession(r: APIRequestContext, email: string) {
  const token = await googleToken(r, email);
  const response = await r.post(`${origin}/api/blog/session`, {
    headers,
    data: { idToken: token.idToken },
  });
  expect(response.ok()).toBe(true);
  return response.json();
}
async function googlePopup(page: Page, email: string) {
  // The emulator relay still loads Google's public GAPI script. Use the real
  // response through Playwright's HTTP transport to avoid a stalled iframe fetch;
  // no Firebase/Google authentication response is mocked.
  await page
    .context()
    .route("https://apis.google.com/js/api.js", async (route) => {
      const response = await route.fetch({ timeout: 20000 });
      expect(response.ok()).toBe(true);
      await route.fulfill({ response });
    });
  await page.goto(`${origin}/admin/blog/login`);
  const popupPromise = page.waitForEvent("popup");
  await page
    .getByRole("button", { name: "Tiếp tục với Google", exact: true })
    .click();
  const popup = await popupPromise;
  await popup.waitForLoadState("load");
  await popup.getByText("Add new account", { exact: true }).click();
  await popup.locator("#email-input").fill(email);
  await popup.locator("#display-name-input").fill("Local Google Owner");
  await popup
    .getByText("Sign in with Google.com", { exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/\/admin\/blog$/, { timeout: 60000 });
  await expect(page.getByRole("heading", { name: "Bài viết của bạn", exact: true })).toBeVisible();
}
test.beforeEach(async () => {
  const db = getFirestore(fixture());
  // Isolated policy reset only in the explicitly guarded demo project, never in preview/production.
  const batch = db.batch();
  const budgetHash = (key: string) => createHmac("sha256", "emulator-only").update(key).digest("hex");
  for (const action of ["comment", "session", "report"])
    batch.delete(db.collection("blogRateLimits").doc(budgetHash(`${action}:global:${Math.floor(Date.now() / 3600000)}`)));
  for (const d of (await db.collection("blogAccess").get()).docs)
    batch.delete(d.ref);
  for (const d of (await db.collection("blogRateLimits").get()).docs)
    batch.delete(d.ref);
  batch.delete(db.collection("blogPolicy").doc("editorial-access-v1"));
  await batch.commit();
});

test("Google-only initial policy, membership UI and immediate revocation", async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  const db = getFirestore(fixture());
  await page.goto(`${origin}/admin/blog/login`);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google" }),
  ).toBeEnabled();
  const response = await page.request.get(`${origin}/admin/blog/login`);
  expect(response.headers()["cross-origin-opener-policy"]).toBe(
    "same-origin-allow-popups",
  );
  expect(
    (await page.request.get(`${origin}/resources/blog`)).headers()[
      "cross-origin-opener-policy"
    ],
  ).toBe("same-origin");
  await googlePopup(page, initial[0]);
  let access = (
    await db.collection("blogAccess").where("active", "==", true).get()
  ).docs;
  expect(access.map((d) => d.get("email")).sort()).toEqual([...initial].sort());
  const second = await browser.newContext();
  await googleSession(second.request, initial[1]);
  expect(
    (await second.request.get(`${origin}/api/admin/blog/posts`)).ok(),
  ).toBe(true);
  const outsider = await browser.newContext();
  const email = `outsider-${randomUUID().slice(0, 8)}@example.test`;
  await googleSession(outsider.request, email);
  const stranger = await getAuth(fixture()).getUserByEmail(email);
  await db.collection("blogMembers").doc(stranger.uid).set({ role: "admin" });
  expect(
    (await outsider.request.get(`${origin}/api/admin/blog/posts`)).status(),
  ).toBe(403);
  expect(
    (
      await outsider.request.post(`${origin}/api/admin/blog/members`, {
        headers,
        data: { email, role: "admin" },
      })
    ).status(),
  ).toBe(403);
  await page.goto(`${origin}/admin/blog/settings`);
  await page.getByRole("button", { name: "Thành viên", exact: true }).click();
  await page
    .getByRole("button", { name: "Thêm thành viên", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email tài khoản").fill(email);
  await dialog.getByLabel("Quyền truy cập").selectOption("author");
  await dialog.getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(
    page.locator(".member").filter({ hasText: email }),
  ).toBeVisible();
  // A current verified session receives its new grant on the next request.
  expect(
    (await outsider.request.get(`${origin}/api/admin/blog/posts`)).ok(),
  ).toBe(true);
  expect(
    (await outsider.request.get(`${origin}/api/admin/blog/members`)).status(),
  ).toBe(403);
  await page
    .locator(".member")
    .filter({ hasText: email })
    .getByRole("button", { name: "Tác giả", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Quyền truy cập").selectOption("publisher");
  await dialog.getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(
    page.locator(".member").filter({ hasText: email }),
  ).toContainText("Người duyệt");
  await page
    .getByRole("button", { name: `Thu hồi quyền ${email}`, exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Thu hồi quyền", exact: true })
    .click();
  await expect(page.locator(".member").filter({ hasText: email })).toHaveCount(
    0,
  );
  expect(
    (await outsider.request.get(`${origin}/api/admin/blog/posts`)).status(),
  ).toBe(403);
  expect(
    (
      await page.request.delete(`${origin}/api/admin/blog/members`, {
        headers,
        data: { id: key(initial[0]) },
      })
    ).status(),
  ).toBe(400);
  // A removed initial identity stays removed after signing in again; policy seeding is one-time.
  expect(
    (
      await page.request.delete(`${origin}/api/admin/blog/members`, {
        headers,
        data: { id: key(initial[1]) },
      })
    ).ok(),
  ).toBe(true);
  await googleSession(second.request, initial[1]);
  expect(
    (await second.request.get(`${origin}/api/admin/blog/posts`)).status(),
  ).toBe(403);
  await page.request.post(`${origin}/api/admin/blog/members`, {
    headers,
    data: { email: initial[1], role: "admin" },
  });
  // Concurrent cross-revocation must leave one admin; a revoked actor cannot finish a stale admin mutation.
  const results = await Promise.all([
    page.request.delete(`${origin}/api/admin/blog/members`, {
      headers,
      data: { id: key(initial[1]) },
    }),
    second.request.delete(`${origin}/api/admin/blog/members`, {
      headers,
      data: { id: key(initial[0]) },
    }),
  ]);
  expect(results.filter((r) => r.ok())).toHaveLength(1);
  access = (await db.collection("blogAccess").where("active", "==", true).get())
    .docs;
  expect(access.filter((d) => d.get("role") === "admin")).toHaveLength(1);
  await second.close();
  await outsider.close();
});

test("server rejects password and unverified Google identities", async ({
  request,
}) => {
  const email = `password-${randomUUID().slice(0, 8)}@example.test`;
  await getAuth(fixture()).createUser({
    email,
    emailVerified: true,
    password: "Synthetic-Only-Password-123!",
  });
  const password = await request.post(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`,
    {
      data: {
        email,
        password: "Synthetic-Only-Password-123!",
        returnSecureToken: true,
      },
    },
  );
  expect(password.ok()).toBe(true);
  expect(
    (
      await request.post(`${origin}/api/blog/session`, {
        headers,
        data: {
          idToken: (await password.json()).idToken,
          email: initial[0],
          role: "admin",
        },
      })
    ).status(),
  ).toBe(403);
  const google = await googleToken(
    request,
    `unverified-${randomUUID().slice(0, 8)}@example.test`,
    false,
  );
  expect(
    (
      await request.post(`${origin}/api/blog/session`, {
        headers,
        data: { idToken: google.idToken },
      })
    ).status(),
  ).toBe(403);
});

test("natural editor workflow: automatic slug, formatting, image, preview and publication", async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  await googleSession(page.request, initial[0]);
  const authorId = "editor-" + randomUUID().slice(0, 8);
  expect(
    (
      await page.request.post(`${origin}/api/admin/blog/authors`, {
        headers,
        data: { id: authorId, name: "Local Test Author" },
      })
    ).ok(),
  ).toBe(true);
  await page.goto(`${origin}/admin/blog`);
  await page.getByRole("button", { name: "Viết bài mới", exact: true }).click();
  await expect(page.getByLabel("Tiêu đề", { exact: true })).toBeVisible();
  const title = `Một trải nghiệm viết tự nhiên ${randomUUID().slice(0, 8)}`;
  await page.getByLabel("Tiêu đề", { exact: true }).fill(title);
  await expect(page.getByLabel("Slug", { exact: true })).toHaveValue(
    /^mot-trai-nghiem-viet-tu-nhien-/,
  );
  const slug = await page.getByLabel("Slug", { exact: true }).inputValue();
  await page
    .getByLabel("Tóm tắt", { exact: true })
    .fill(
      "Bài thử nghiệm editor trong Firebase emulator, không xuất bản thật.",
    );
  await page.getByLabel("Tác giả", { exact: true }).selectOption(authorId);
  const body = page.getByRole("textbox", { name: "Nội dung bài viết" });
  await body.fill("Một ý tưởng rõ ràng giúp người đọc hiểu điều quan trọng.");
  await body.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "In đậm", exact: true }).click();
  await expect(body.locator("strong")).toHaveText(/Một ý tưởng/);
  await expect(
    page.getByRole("button", { name: "Làm lại", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  await expect(body.locator("strong")).toHaveCount(0);
  await page.getByRole("button", { name: "Làm lại", exact: true }).click();
  await expect(body.locator("strong")).toHaveCount(1);
  await body.click();
  await body.press("ControlOrMeta+End");
  await body.press("Enter");
  await body.pressSequentially("Phần nội dung tiếp theo.");
  await page.getByLabel("Kiểu đoạn văn").selectOption("2");
  await expect(body.locator("h2")).toHaveText("Phần nội dung tiếp theo.");
  await body.press("End");
  await body.press("Enter");
  const image = await sharp({
    create: { width: 320, height: 160, channels: 3, background: "#173df5" },
  })
    .png()
    .toBuffer();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Chèn ảnh hoặc GIF", exact: true }).click();
  await (
    await chooser
  ).setFiles({ name: "test.png", mimeType: "image/png", buffer: image });
  const imageDialog = page.getByRole("dialog");
  await imageDialog.getByLabel("Mô tả ảnh").fill("Ảnh kiểm thử màu xanh");
  await imageDialog
    .getByRole("button", { name: "Chèn ảnh", exact: true })
    .click();
  await expect(body.getByAltText("Ảnh kiểm thử màu xanh")).toBeVisible();
  await page
    .getByRole("textbox", {
      name: "Nguồn tham khảo — mỗi dòng: tên | URL",
      exact: true,
    })
    .fill("Firebase documentation | https://firebase.google.com/docs/auth");
  await expect(
    page.getByRole("textbox", {
      name: "Nguồn tham khảo — mỗi dòng: tên | URL",
      exact: true,
    }),
  ).toHaveValue(
    "Firebase documentation | https://firebase.google.com/docs/auth",
  );
  await expect(body.locator("strong").first()).toContainText("Một ý tưởng");
  // Preview must save the latest content, even before the autosave timer fires.
  const previewPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Xem trước", exact: true }).click();
  const preview = await previewPromise;
  await expect(
    preview.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await preview.close();
  await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Xuất bản ngay", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cập nhật", exact: true }),
  ).toBeVisible();
  const visitor = await browser.newContext();
  const publicPage = await visitor.newPage();
  await publicPage.goto(`${origin}/resources/blog/${slug}`);
  await expect(
    publicPage.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await expect(publicPage.getByAltText("Ảnh kiểm thử màu xanh")).toBeVisible();
  await expect(
    publicPage.locator(".article-prose strong").first(),
  ).toContainText("Một ý tưởng");
  expect(
    (
      await publicPage.request.get(
        `${origin}/admin/blog/${page.url().split("/").pop()}/preview`,
        { maxRedirects: 0 },
      )
    ).status(),
  ).not.toBe(200);
  const id = page.url().split("/").pop();
  const latest = await (
    await page.request.get(`${origin}/api/admin/blog/posts/${id}`)
  ).json();
  expect(
    (
      await page.request.post(
        `${origin}/api/admin/blog/posts/${id}/unpublish`,
        {
          headers,
          data: { revision: latest.revision, operationId: randomUUID() },
        },
      )
    ).ok(),
  ).toBe(true);
  await page.reload();
  const lastEdit = "Thay đổi cuối trước khi trở về danh sách.";
  await page.getByLabel("Tóm tắt", { exact: true }).fill(lastEdit);
  await page.getByRole("link", { name: "Trở về bài viết" }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  const persisted = await (
    await page.request.get(`${origin}/api/admin/blog/posts/${id}`)
  ).json();
  expect(persisted.summary).toBe(lastEdit);
  await visitor.close();
});

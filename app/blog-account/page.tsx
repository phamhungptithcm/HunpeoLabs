import { Login } from "@/components/blog-admin/login";
import { Account } from "@/components/blog-admin/account";
import { currentActor } from "@/lib/blog/auth";
import { BlogError } from "@/lib/blog/schema";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tài khoản",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const actor = await currentActor().catch((e) => {
    if (e instanceof BlogError && [401, 403, 503].includes(e.status))
      return null;
    throw e;
  });
  return (
    <main lang="vi">
      {actor ? (
        <Account name={actor.name} avatar={actor.avatar} staff={["admin", "publisher", "author"].includes(actor.role ?? "")} />
      ) : (
        <div className="blog-surface"><Login returnTo={returnTo} embedded /></div>
      )}
    </main>
  );
}

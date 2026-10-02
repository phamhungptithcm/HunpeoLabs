import { currentActor } from "@/lib/blog/auth";
import { BlogError } from "@/lib/blog/schema";
import { StudioShell } from "@/components/blog-admin/chrome";
export const metadata = {
  title: "Blog workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await currentActor().catch((e) => {
    if (e instanceof BlogError && [401, 403, 503].includes(e.status))
      return null;
    throw e;
  });
  return (
    <StudioShell
      user={actor ? { name: actor.name, role: actor.role ?? "reader", avatar: actor.avatar } : null}
    >
      {children}
    </StudioShell>
  );
}

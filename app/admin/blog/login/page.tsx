import { Login } from "@/components/blog-admin/login";
import { currentActor } from "@/lib/blog/auth";
import { BlogError } from "@/lib/blog/schema";
import { redirect } from "next/navigation";
export default async function Page() {
  const actor = await currentActor().catch((e) => {
    if (e instanceof BlogError && [401, 403, 503].includes(e.status))
      return null;
    throw e;
  });
  if (actor?.role) redirect("/admin/blog");
  return <Login admin />;
}

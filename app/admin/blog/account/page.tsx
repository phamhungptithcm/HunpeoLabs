import { requireStaff } from "@/lib/blog/auth";
import { BlogError } from "@/lib/blog/schema";
import { redirect } from "next/navigation";
import { Account } from "@/components/blog-admin/account";
export const metadata = { title: "Tài khoản Studio" };
export default async function Page() {
  let actor;
  try {
    actor = await requireStaff();
  } catch (error) {
    if (error instanceof BlogError && error.status === 401) redirect("/admin/blog/login");
    if (error instanceof BlogError && error.status === 403) redirect("/blog-account");
    throw error;
  }
  return <Account name={actor.name} avatar={actor.avatar} staff embedded />;
}

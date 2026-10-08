import { requireVerifiedUser } from "@/lib/auth";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("My account");

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireVerifiedUser("/dashboard");
  return <div className="container-x py-10 sm:py-14">{children}</div>;
}

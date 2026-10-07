import { requireVerifiedUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireVerifiedUser("/dashboard");
  return <div className="container-x py-10 sm:py-14">{children}</div>;
}

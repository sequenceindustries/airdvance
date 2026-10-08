import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { privateMetadata } from "@/lib/site";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/loans", label: "Loans" },
  { href: "/admin/messages", label: "Messages" },
];

export const metadata = privateMetadata("Admin");

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div>
      <div className="border-b border-ink/[0.06] bg-night-900">
        <div className="container-x flex items-center gap-1 overflow-x-auto py-2 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full px-3.5 py-2 text-ink-muted hover:bg-ink/5 hover:text-ink">
              {n.label}
            </Link>
          ))}
          <span className="ml-auto hidden whitespace-nowrap text-xs text-ink-faint sm:block">Signed in as {admin.full_name}</span>
        </div>
      </div>
      <div className="container-x py-8 sm:py-10">{children}</div>
    </div>
  );
}

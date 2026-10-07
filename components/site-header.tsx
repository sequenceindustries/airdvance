import Link from "next/link";
import Image from "next/image";
import { logout } from "@/lib/actions/auth";
import { MobileMenu } from "./mobile-menu";

export const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/costs", label: "Costs" },
  { href: "/eligibility", label: "Who can apply" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ user }: { user: { name: string; role: string } | null }) {
  const accountHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-night/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Airdvance home">
          <Image src="/airdvance-logo.png" alt="Airdvance" width={1568} height={436} priority className="h-7 w-auto sm:h-8" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-ink-muted lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href={accountHref} className="btn-ghost btn-sm hidden sm:inline-flex">
                {user.role === "ADMIN" ? "Admin" : "My account"}
              </Link>
              <form action={logout} className="hidden sm:block">
                <button className="btn btn-sm text-ink-muted hover:text-ink">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm hidden text-ink-muted hover:text-ink sm:inline-flex">
                Log in
              </Link>
              <Link href="/apply" className="btn-primary btn-sm">
                Apply now
              </Link>
            </>
          )}
          <MobileMenu items={NAV} user={user ? { accountHref, isAdmin: user.role === "ADMIN" } : null} />
        </div>
      </div>
    </header>
  );
}

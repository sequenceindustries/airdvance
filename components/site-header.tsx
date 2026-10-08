import Link from "next/link";
import { Logo } from "./logo";
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
    <header className="sticky top-0 z-40 bg-night/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Airdvance home">
          <Logo size="sm" />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm text-ink/85 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href={accountHref} className="btn-ghost btn-sm hidden px-4 py-2 sm:inline-flex">
                {user.role === "ADMIN" ? "Admin" : "My account"}
              </Link>
              <form action={logout} className="hidden sm:block">
                <button className="btn btn-sm text-ink-muted hover:text-ink">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm hidden px-4 py-2 sm:inline-flex">
                Log in
              </Link>
              <Link href="/apply" data-track="apply_click" data-track-location="header" className="btn btn-sm bg-ink px-4 py-2 text-night hover:bg-white">
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

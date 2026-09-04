import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/actions/auth";

export function SiteHeader({ profile }: { profile: { role: string; full_name: string } | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/airdvance-logo.png" alt="Airdvance" width={152} height={42} priority className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <Link href="/shop/smartphones" className="hover:text-accent">Smartphones</Link>
          <Link href="/shop/tablets" className="hover:text-accent">Tablets</Link>
          <Link href="/how-it-works" className="hover:text-accent">How it works</Link>
          <Link href="/faq" className="hover:text-accent">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {profile ? (
            <>
              <Link
                href={profile.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10"
              >
                {profile.role === "ADMIN" ? "Admin" : "My account"}
              </Link>
              <form action={signOut}>
                <button className="rounded-md border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/10 focus-ring">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10">
                Log in
              </Link>
              <Link
                href="/shop"
                className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark focus-ring"
              >
                Shop devices
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

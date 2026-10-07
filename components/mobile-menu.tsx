"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions/auth";

export function MobileMenu({
  items,
  user,
}: {
  items: { href: string; label: string }[];
  user: { accountHref: string; isAdmin: boolean } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-white/10 bg-night-900/95 backdrop-blur-xl">
          <nav className="container-x flex flex-col py-3" aria-label="Mobile">
            {items.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-xl px-3 py-3 text-base text-ink-muted hover:bg-white/5 hover:text-ink">
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-white/10 px-3 pt-4">
              {user ? (
                <>
                  <Link href={user.accountHref} className="btn-ghost flex-1">
                    {user.isAdmin ? "Admin" : "My account"}
                  </Link>
                  <form action={logout} className="flex-1">
                    <button className="btn-ghost w-full">Log out</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="btn-ghost flex-1">
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

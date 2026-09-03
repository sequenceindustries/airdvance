import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <p className="font-display text-xl">Airdvance</p>
          <p className="mt-2 max-w-xs text-sm text-slate-600">
            Get the device you need now. Pay over time. Own it.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-slate-800">Shop</p>
          <ul className="space-y-2 text-slate-600">
            <li><Link href="/shop/smartphones" className="hover:text-ink">Smartphones</Link></li>
            <li><Link href="/shop/tablets" className="hover:text-ink">Tablets</Link></li>
            <li><Link href="/shop/laptops" className="hover:text-ink">Laptops</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-slate-800">Airdvance</p>
          <ul className="space-y-2 text-slate-600">
            <li><Link href="/how-it-works" className="hover:text-ink">How it works</Link></li>
            <li><Link href="/faq" className="hover:text-ink">FAQ</Link></li>
            <li><Link href="/apply" className="hover:text-ink">Apply now</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-slate-800">Account</p>
          <ul className="space-y-2 text-slate-600">
            <li><Link href="/login" className="hover:text-ink">Log in</Link></li>
            <li><Link href="/register" className="hover:text-ink">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Airdvance. Devices remain the property of Airdvance until all qualifying payments are completed.
      </div>
    </footer>
  );
}

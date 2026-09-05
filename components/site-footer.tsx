import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-5">
        <div className="md:col-span-1">
          <Image src="/airdvance-logo.png" alt="airdvance" width={128} height={35} className="h-8 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-slate-300">
            Get the device you need now. Pay over time. Buy it.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-slate-100">Shop</p>
          <ul className="space-y-2 text-slate-300">
            <li><Link href="/shop/smartphones" className="hover:text-accent">Smartphones</Link></li>
            <li><Link href="/shop/tablets" className="hover:text-accent">Tablets</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-slate-100">airdvance</p>
          <ul className="space-y-2 text-slate-300">
            <li><Link href="/how-it-works" className="hover:text-accent">How it works</Link></li>
            <li><Link href="/faq" className="hover:text-accent">FAQ</Link></li>
            <li><Link href="/apply" className="hover:text-accent">Apply now</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-slate-100">Legal</p>
          <ul className="space-y-2 text-slate-300">
            <li><Link href="/terms" className="hover:text-accent">Terms & conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-accent">Privacy policy</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-slate-100">Account</p>
          <ul className="space-y-2 text-slate-300">
            <li><Link href="/login" className="hover:text-accent">Log in</Link></li>
            <li><Link href="/register" className="hover:text-accent">Create account</Link></li>
            <li><Link href="/contact" className="hover:text-accent">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} airdvance. This is a rent-to-buy agreement, not a credit agreement.
        Devices remain the property of airdvance until the buyout payment is completed. Read our{" "}
        <Link href="/terms" className="underline hover:text-accent">Terms & Conditions</Link>.
      </div>
    </footer>
  );
}

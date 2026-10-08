import Link from "next/link";
import { Logo } from "./logo";
import { COMPANY } from "@/lib/config";

const COLS = [
  {
    title: "Borrow",
    links: [
      { href: "/apply", label: "Apply now" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/costs", label: "Costs & repayment" },
      { href: "/eligibility", label: "Who can apply" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
      { href: "/responsible-lending", label: "Responsible lending" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & conditions" },
      { href: "/privacy", label: "Privacy policy (POPIA)" },
      { href: "/paia", label: "PAIA manual" },
      { href: "/complaints", label: "Complaints" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-night-900 text-[13px] sm:mt-28">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo size="sm" />
          <p className="mt-4 max-w-xs leading-relaxed text-ink-muted">R300 to R1,000 until payday.</p>
          <p className="mt-4 text-xs text-ink-faint">
            {COMPANY.email}
            {COMPANY.phone ? ` · ${COMPANY.phone}` : ""}
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="font-semibold text-ink">{c.title}</p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink/[0.06]">
        <div className="container-x space-y-2 py-6 text-xs leading-relaxed text-ink-faint">
          <p>
            Airdvance is a trading name of {COMPANY.legalName}, registered credit provider {COMPANY.ncrcp}. Credit is subject to
            an affordability check.
          </p>
          <p>Example: R1,000 for 30 days costs R274.32 (R165 initiation, R60 service, R49.32 interest at 5% a month). You repay R1,274.32.</p>
        </div>
      </div>
    </footer>
  );
}

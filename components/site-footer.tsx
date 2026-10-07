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
    <footer className="mt-24 border-t border-ink/[0.06] bg-night-900">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            Short-term cash advances of R300 to R1,000, repaid on your next payday. Every cost shown before you apply.
          </p>
          <p className="mt-4 text-xs text-ink-faint">
            {COMPANY.email}
            {COMPANY.phone ? ` · ${COMPANY.phone}` : ""}
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold text-ink">{c.title}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-muted">
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
            Airdvance is a trading name of {COMPANY.legalName}, a registered credit provider ({COMPANY.ncrcp})
            {COMPANY.registrationNumber ? `, company registration ${COMPANY.registrationNumber}` : ""}. All credit is
            subject to an affordability assessment and the National Credit Act 34 of 2005. Approval is not guaranteed.
          </p>
          <p>
            Representative example: borrow R1,000 for 30 days — initiation fee R165.00, service fee R60.00, interest
            R49.32 (5% per month, 60% per year) — total repayable R1,274.32. Late or missed payments may be reported to
            credit bureaus and can make it harder to borrow in future.
          </p>
          <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

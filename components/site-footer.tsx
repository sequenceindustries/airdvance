import Link from "next/link";
import { Logo } from "./logo";
import { COMPANY } from "@/lib/config";
import { addDays } from "@/lib/dates";
import { calculateQuote, formatRand, type Quote } from "@/lib/pricing";
import { CookieSettingsButton } from "./analytics";

// Representative example, computed from the live pricing rules so it can never drift.
const EX = calculateQuote({ principal: 1000, startDate: "2026-01-01", dueDate: addDays("2026-01-01", 30), allowShortTerm: true }) as Quote;

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
                  <Link href={l.href} className="hover:text-ink" {...(l.href === "/apply" ? { "data-track": "apply_click", "data-track-location": "footer" } : {})}>
                    {l.label}
                  </Link>
                </li>
              ))}
              {c.title === "Legal" && (
                <li>
                  <CookieSettingsButton />
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink/[0.06]">
        <div className="container-x space-y-2 py-6 text-xs leading-relaxed text-ink-faint">
          <p>
            Airdvance is a trading name of {COMPANY.legalName}
            {COMPANY.registrationNumber ? ` (reg. ${COMPANY.registrationNumber})` : ""}, registered credit provider {COMPANY.ncrcp}. Credit is
            subject to an affordability assessment.
          </p>
          <p>
            Example: {formatRand(EX.principal, { cents: false })} for {EX.days} days costs {formatRand(EX.costOfCredit)} ({formatRand(EX.initiationFee, { cents: false })} initiation fee,{" "}
            {formatRand(EX.serviceFee, { cents: false })} service fee, {formatRand(EX.interest)} interest at 5% a month on a first loan). You repay {formatRand(EX.totalRepayable)} in one payment.
          </p>
        </div>
      </div>
    </footer>
  );
}

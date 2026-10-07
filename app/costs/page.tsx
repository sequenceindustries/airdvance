import Link from "next/link";
import { Calculator } from "@/components/calculator";
import { CtaBand, PageHero } from "@/components/ui";
import { PRODUCT } from "@/lib/config";
import { addDays, defaultPayday, todaySA } from "@/lib/dates";
import { formatRand, representativeExamples } from "@/lib/pricing";

export const metadata = { title: "Costs & repayment" };

export default function CostsPage() {
  const today = todaySA();
  const examples30 = representativeExamples(today, addDays(today, 30));
  const examples14 = representativeExamples(today, addDays(today, 14));

  return (
    <>
      <PageHero
        eyebrow="Costs & repayment"
        title="Every rand, up front"
        intro="Airdvance charges three things, each within the limits the National Credit Act sets for short-term credit. Nothing else is added."
      />
      <section className="container-x grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div className="space-y-4">
          {[
            ["Initiation fee — R165 once-off", "Charged once per loan for assessing your application and setting up your agreement. The legal maximum for amounts up to R1,000 is R165."],
            ["Service fee — R60 per month, pro-rated", "Covers administering your loan. We charge it by the day: R2 per day, never more than R60 for a month. Repay after 10 days and you pay R20."],
            ["Interest — 5% per month on your first loan this year", "Charged on the amount you borrowed, for the days you have it (60% per year, simple interest). For your second and later loans in the same calendar year, the rate drops to 3% per month."],
          ].map(([t, b]) => (
            <div key={t} className="glass p-6">
              <h2 className="text-lg font-semibold">{t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b}</p>
            </div>
          ))}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold">What we never charge</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
              <li>Application fees, or anything if you're declined</li>
              <li>Credit life or any other insurance</li>
              <li>Early settlement penalties</li>
              <li>Penalty interest rates if you pay late</li>
            </ul>
          </div>
        </div>
        <div className="lg:sticky lg:top-24">
          <Calculator today={today} defaultDue={defaultPayday(today, PRODUCT.minDays, PRODUCT.maxDays)} compact />
        </div>
      </section>

      <section className="container-x mt-20 grid gap-6 lg:grid-cols-2">
        {[
          { title: "Repaid after 30 days", rows: examples30 },
          { title: "Repaid after 14 days", rows: examples14 },
        ].map((t) => (
          <div key={t.title} className="glass overflow-hidden">
            <p className="border-b border-ink/10 px-5 py-4 font-semibold">{t.title} <span className="text-xs font-normal text-ink-faint">· first loan of the year</span></p>
            <div className="overflow-x-auto">
              <table className="table-x min-w-[480px] tabular-nums">
                <thead><tr><th>Borrow</th><th>Fees</th><th>Interest</th><th>Cost</th><th className="text-right">Repay</th></tr></thead>
                <tbody>
                  {t.rows.map((q) => (
                    <tr key={q.principal}>
                      <td className="font-semibold">{formatRand(q.principal, { cents: false })}</td>
                      <td className="text-ink-muted">{formatRand(q.initiationFee + q.serviceFee)}</td>
                      <td className="text-ink-muted">{formatRand(q.interest)}</td>
                      <td className="text-ink-muted">{q.costPercent.toFixed(1)}%</td>
                      <td className="text-right font-semibold">{formatRand(q.totalRepayable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section className="container-x mt-20 grid gap-4 md:grid-cols-3">
        {[
          ["Repaying on time", "One DebiCheck debit order collects the total in your agreement on your payday. Make sure the money is in your account that morning."],
          ["Repaying early", "Settle any time from your dashboard or by EFT. You pay the initiation fee plus interest and service fee only for the days you used — at least one day."],
          ["If a payment fails", "Contact us straight away. Interest continues at the same agreed rate (no penalty rate), capped by the in duplum rule. We send written notice before reporting to credit bureaus or taking any legal step, and you may approach a debt counsellor."],
        ].map(([t, b]) => (
          <div key={t} className="glass p-6">
            <h3 className="text-lg font-semibold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b}</p>
          </div>
        ))}
      </section>
      <p className="container-x mt-8 text-xs leading-relaxed text-ink-faint">
        Amounts include VAT where applicable. The initiation fee is fixed, so it is a bigger share of smaller loans —
        borrowing R300 for 30 days costs {examples30[0].costPercent.toFixed(1)}% of the amount, while R1,000 costs{" "}
        {examples30[3].costPercent.toFixed(1)}%. Your exact figures appear in your
        pre-agreement statement before you sign. See our <Link href="/terms" className="underline">terms</Link>.
      </p>
      <CtaBand />
    </>
  );
}

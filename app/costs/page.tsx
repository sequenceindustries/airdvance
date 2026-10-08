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
        title="Costs"
        intro="Three charges, each capped by law. Nothing else."
      />
      <section className="container-x grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div className="space-y-4">
          {[
            ["R165", "Initiation fee", "Once per loan."],
            ["R2 a day", "Service fee", "R60 a month at most. Charged only for the days you use."],
            ["5% a month", "Interest", "On the amount borrowed. 3% for later loans in the same year."],
            ["R0", "Everything else", "No insurance, application fee or early-settlement penalty."],
          ].map(([k, t, b]) => (
            <div key={t} data-reveal className="glass flex items-start justify-between gap-6 p-6">
              <div>
                <h2 className="text-lg font-semibold">{t}</h2>
                <p className="mt-1 text-sm text-ink-muted">{b}</p>
              </div>
              <p className="shrink-0 font-display text-xl font-semibold text-ember-300">{k}</p>
            </div>
          ))}
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

      <p className="container-x mt-6 text-sm text-ink-faint">Late payment doesn't add penalty interest. Smaller loans cost more as a share because the initiation fee is fixed.</p>
      <CtaBand />
    </>
  );
}

import { Calculator } from "@/components/calculator";
import { CtaBand, PageHero, RelatedLinks } from "@/components/ui";
import { PRODUCT } from "@/lib/config";
import { addDays, defaultPayday, todaySA } from "@/lib/dates";
import { formatRand, representativeExamples } from "@/lib/pricing";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/costs");

export default function CostsPage() {
  const today = todaySA();
  const examples30 = representativeExamples(today, addDays(today, 30));
  const examples14 = representativeExamples(today, addDays(today, 14));

  return (
    <>
      <PageHero
        eyebrow="Costs & repayment"
        title="Costs and repayment"
        intro="Three charges, each within the maximums set under the National Credit Act. Nothing else is added if you repay on time."
      />
      <section className="container-x grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div className="space-y-4">
          {[
            ["R165", "Initiation fee", "Once per loan."],
            ["R2 a day", "Service fee", "R60 a month at most. Charged only for the days you use."],
            ["5% a month", "Interest", "On the amount borrowed, charged per day. 3% a month for any later loan in the same calendar year."],
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
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${t.title} examples`}>
              <table className="table-x min-w-[480px] tabular-nums">
                <thead><tr><th>Borrow</th><th>Fees</th><th>Interest</th><th>Cost of credit</th><th className="text-right">You repay</th></tr></thead>
                <tbody>
                  {t.rows.map((q) => (
                    <tr key={q.principal}>
                      <td className="font-semibold">{formatRand(q.principal, { cents: false })}</td>
                      <td className="text-ink-muted">{formatRand(q.initiationFee + q.serviceFee)}</td>
                      <td className="text-ink-muted">{formatRand(q.interest)}</td>
                      <td className="text-ink-muted">{formatRand(q.costOfCredit)} <span className="text-xs text-ink-faint">({q.costPercent.toFixed(1)}%)</span></td>
                      <td className="text-right font-semibold">{formatRand(q.totalRepayable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <p className="container-x mt-4 text-sm text-ink-faint">
        Fees are the initiation fee plus the service fee for the days shown. The percentage is the cost of credit as a share of the amount borrowed;
        smaller loans cost more as a share because the initiation fee is fixed. Your exact total depends on the day we pay you and is confirmed in your
        pre-agreement statement before you sign.
      </p>

      <section aria-labelledby="repaying" className="container-x mt-20 grid gap-4 lg:grid-cols-3">
        <h2 id="repaying" className="text-3xl font-semibold lg:col-span-3">What you must repay</h2>
        <div data-reveal className="glass p-6">
          <h3 className="font-semibold">On your repayment date</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            The full total in your agreement, in one payment, collected by a DebiCheck debit order you approve with your bank. There are no instalments.
          </p>
        </div>
        <div data-reveal className="glass p-6">
          <h3 className="font-semibold">If you settle early</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            You pay the amount borrowed, the initiation fee, and interest and service fee only for the days you had the money. No early-settlement penalty.
          </p>
        </div>
        <div data-reveal className="glass p-6">
          <h3 className="font-semibold">If you pay late</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Interest keeps running at the same daily rate on the amount borrowed. There are no penalty fees, and what builds up while you&rsquo;re in default
            can never exceed the unpaid balance at that time. Missed payments may be reported to credit bureaus after we give you written notice.
          </p>
        </div>
      </section>

      <RelatedLinks
        links={[
          { href: "/eligibility", label: "Who can apply", note: "Requirements and documents." },
          { href: "/how-it-works", label: "How it works", note: "From application to payday." },
          { href: "/responsible-lending", label: "Responsible lending", note: "Borrowing safely and getting help." },
        ]}
      />
      <CtaBand />
    </>
  );
}

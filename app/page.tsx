import Link from "next/link";
import { Calculator } from "@/components/calculator";
import { Check, CtaBand, FaqList, Glow, SectionHeading } from "@/components/ui";
import { COMPANY, PRODUCT } from "@/lib/config";
import { ELIGIBILITY, FAQS, REQUIREMENTS, STEPS } from "@/lib/content";
import { addDays, defaultPayday, todaySA } from "@/lib/dates";
import { formatRand, representativeExamples } from "@/lib/pricing";

export default function HomePage() {
  const today = todaySA();
  const due = defaultPayday(today, PRODUCT.minDays, PRODUCT.maxDays);
  const examples = representativeExamples(today, addDays(today, 30));

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <Glow />
        <div className="container-x relative grid gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Registered credit provider · {COMPANY.ncrcp}
            </p>
            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.04] sm:text-6xl lg:text-[4.2rem]">
              Cash for the gap <span className="text-gradient">before payday.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
              Borrow R300 to R1,000 online and repay it in one go on your next payday. Every fee is shown in rands before you
              apply, and nothing is added when you repay on time.
            </p>
            <ul className="mt-7 grid gap-3 text-sm text-ink sm:grid-cols-2">
              {["No hidden fees or insurance", "Settle early, pay less", "Reviewed by a real person", "One DebiCheck debit order"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 hidden gap-3 sm:flex">
              <Link href="/how-it-works" className="btn-ghost">
                How it works
              </Link>
              <Link href="/costs" className="btn btn-sm px-4 text-ink-muted hover:text-ink">
                Full cost breakdown →
              </Link>
            </div>
          </div>
          <Calculator today={today} defaultDue={due} />
        </div>
      </section>

      {/* Steps */}
      <section className="container-x mt-8">
        <SectionHeading
          eyebrow="How it works"
          title="Five clear steps, no surprises"
          intro="Everything happens online. You'll always know where your application stands."
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="glass relative p-5">
              <span className="font-display text-sm font-semibold text-ember-300">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Costs */}
      <section className="container-x mt-24 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="What it costs"
            title="Three charges. All capped by law."
            intro="Our fees stay within the limits set for short-term credit under the National Credit Act. No credit life insurance, no application fee, no early-settlement penalty."
          />
          <div className="mt-8 space-y-3">
            {[
              { k: "Initiation fee", v: "R165 once-off", d: "Covers assessing your application and setting up your agreement." },
              { k: "Service fee", v: "R60 per month", d: "Pro-rated by day — a 15-day loan pays R30." },
              { k: "Interest", v: "5% per month", d: "On the amount borrowed, for the days you have it (3% for later loans in the same calendar year)." },
            ].map((c) => (
              <div key={c.k} className="glass flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{c.k}</p>
                  <p className="mt-1 text-sm text-ink-muted">{c.d}</p>
                </div>
                <p className="shrink-0 font-display text-sm font-semibold text-ember-300">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="font-semibold">Representative examples</p>
            <p className="text-xs text-ink-faint">First loan of the year, repaid after 30 days</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table-x min-w-[520px]">
              <thead>
                <tr>
                  <th>You borrow</th>
                  <th>Initiation</th>
                  <th>Service</th>
                  <th>Interest</th>
                  <th className="text-right">You repay</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {examples.map((q) => (
                  <tr key={q.principal}>
                    <td className="font-semibold text-ink">{formatRand(q.principal, { cents: false })}</td>
                    <td className="text-ink-muted">{formatRand(q.initiationFee)}</td>
                    <td className="text-ink-muted">{formatRand(q.serviceFee)}</td>
                    <td className="text-ink-muted">{formatRand(q.interest)}</td>
                    <td className="text-right font-semibold text-ink">{formatRand(q.totalRepayable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-4 text-xs leading-relaxed text-ink-faint">
            The initiation fee is the same for every amount, so smaller loans cost more as a percentage. Borrow only
            what you need.{" "}
            <Link href="/costs" className="text-ember-300 underline underline-offset-2">
              Full cost breakdown
            </Link>
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="container-x mt-24">
        <SectionHeading eyebrow="Before you apply" title="Check you qualify and have your documents ready" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="glass p-6">
            <h3 className="text-lg font-semibold">You can apply if</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              {ELIGIBILITY.map((e) => (
                <li key={e} className="flex gap-3">
                  <Check /> {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass p-6">
            <h3 className="text-lg font-semibold">You'll need</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              {REQUIREMENTS.map((e) => (
                <li key={e} className="flex gap-3">
                  <Check /> {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container-x mt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Lending you can afford",
              b: "We assess your income and expenses before every loan. If the repayment would stretch you too far, we won't lend — that protects you.",
            },
            {
              t: "Your information, protected",
              b: "Encrypted connections, encrypted ID and bank numbers, and POPIA-compliant handling. We never sell your data or ask for banking passwords.",
            },
            {
              t: "Help if things change",
              b: "Struggling to repay? Talk to us before your payday. You also have the right to apply to a registered debt counsellor.",
            },
          ].map((c) => (
            <div key={c.t} className="glass p-6">
              <h3 className="text-lg font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-faint">
          Read our{" "}
          <Link href="/responsible-lending" className="text-ember-300 underline underline-offset-2">
            responsible lending commitments
          </Link>
          .
        </p>
      </section>

      {/* FAQ */}
      <section className="container-x mt-24 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          intro={
            <>
              Can't find what you need?{" "}
              <Link href="/contact" className="text-ember-300 underline underline-offset-2">
                Contact us
              </Link>
              .
            </>
          }
        />
        <FaqList items={FAQS.filter((f) => f.home)} />
      </section>

      <CtaBand />
    </>
  );
}

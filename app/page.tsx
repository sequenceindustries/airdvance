import Link from "next/link";
import { Calculator } from "@/components/calculator";
import { Check, CtaBand, FaqList } from "@/components/ui";
import { COMPANY, PRODUCT } from "@/lib/config";
import { ELIGIBILITY, FAQS, REQUIREMENTS, STEPS } from "@/lib/content";
import { addDays, defaultPayday, todaySA } from "@/lib/dates";
import { formatRand, representativeExamples } from "@/lib/pricing";

export default function HomePage() {
  const today = todaySA();
  const due = defaultPayday(today, PRODUCT.minDays, PRODUCT.maxDays);
  const examples = representativeExamples(today, addDays(today, 30));
  const r1000 = examples[3];

  return (
    <>
      {/* Hero — dark, centered, oversized type */}
      <section className="relative overflow-hidden bg-black text-white">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[-30%] mx-auto h-[70%] max-w-4xl rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,.35),transparent)] blur-2xl" />
        <div className="container-x relative pb-24 pt-16 text-center sm:pb-32 sm:pt-24">
          <p className="text-lg font-semibold text-white/90 sm:text-xl">Airdvance Cash Advance</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-5xl font-semibold leading-[1.03] tracking-[-0.035em] sm:text-7xl lg:text-[88px]">
            Payday.
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">A little sooner.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-snug text-white/70 sm:text-2xl">
            R300 to R1,000. One repayment on payday. Every rand shown before you apply.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-7">
            <Link href="/apply" className="btn-primary px-6 py-3 text-[17px]">
              Apply
            </Link>
            <Link href="#calculator" className="link-more text-emerald-300">
              See what it costs
            </Link>
          </div>
          <p className="mt-14 font-semibold tabular-nums tracking-[-0.04em] text-white/90">
            <span className="block text-sm font-medium tracking-normal text-white/50">Borrow R1,000 for 30 days. Repay</span>
            <span className="text-6xl sm:text-8xl">{formatRand(r1000.totalRepayable)}</span>
            <span className="mt-2 block text-sm font-medium tracking-normal text-white/50">
              Initiation {formatRand(r1000.initiationFee)} · Service {formatRand(r1000.serviceFee)} · Interest {formatRand(r1000.interest)}
            </span>
          </p>
          <p className="mt-10 text-xs text-white/40">
            Registered credit provider {COMPANY.ncrcp}. Approval subject to an affordability assessment.
          </p>
        </div>
      </section>

      {/* Configurator */}
      <section id="calculator" className="scroll-mt-14 py-20 sm:py-28">
        <div className="container-x">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Choose your amount.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted sm:text-xl">Move the slider. Pick your payday. The total updates instantly.</p>
          </div>
          <div className="mx-auto mt-12 max-w-xl">
            <Calculator today={today} defaultDue={due} />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-black py-20 text-white sm:py-28">
        <div className="container-x">
          <h2 className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Simple by design.</h2>
          <dl className="mt-14 grid gap-x-8 gap-y-12 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "R300–R1,000", v: "Borrow only what you need, in R50 steps." },
              { k: "5–31 days", v: "Repay in one go on your next payday." },
              { k: "R0", v: "Penalty for settling early. Ever." },
              { k: "1", v: "DebiCheck debit order. Nothing else." },
            ].map((s) => (
              <div key={s.k}>
                <dt className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-semibold tracking-[-0.04em] text-transparent sm:whitespace-nowrap lg:text-5xl">{s.k}</dt>
                <dd className="mx-auto mt-3 max-w-[16rem] text-[17px] leading-snug text-white/60">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Steps — bento */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Five steps. No surprises.</h2>
            <Link href="/how-it-works" className="link-more">
              How it works
            </Link>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className={`glass flex flex-col p-7 sm:p-8 ${i < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}>
                <span className="text-5xl font-semibold tracking-[-0.04em] text-ember">{i + 1}</span>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">{s.title}.</h3>
                <p className="mt-2 text-[17px] leading-snug text-ink-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Costs */}
      <section className="bg-night-800 py-20 sm:py-28">
        <div className="container-x">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Three charges. All capped by law.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted sm:text-xl">
              Within National Credit Act limits. No credit life insurance. No application fee. No early-settlement penalty.
            </p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              { k: "R165", t: "Initiation fee", d: "Once-off, for assessing your application and setting up your agreement." },
              { k: "R2/day", t: "Service fee", d: "R60 a month, charged by the day. Ten days costs R20." },
              { k: "5%", t: "Interest per month", d: "On the amount borrowed, for the days you have it. 3% for later loans the same year." },
            ].map((c) => (
              <div key={c.t} className="rounded-3xl bg-night p-8 text-center">
                <p className="text-5xl font-semibold tracking-[-0.04em] text-ink">{c.k}</p>
                <p className="mt-3 text-lg font-semibold">{c.t}</p>
                <p className="mt-2 text-[15px] leading-snug text-ink-muted">{c.d}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl bg-night px-3 py-2">
            <div className="overflow-x-auto">
              <table className="table-x min-w-[520px]">
                <thead>
                  <tr>
                    <th>Borrow (30 days)</th>
                    <th>Initiation</th>
                    <th>Service</th>
                    <th>Interest</th>
                    <th className="text-right">You repay</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {examples.map((q) => (
                    <tr key={q.principal}>
                      <td className="font-semibold">{formatRand(q.principal, { cents: false })}</td>
                      <td className="text-ink-muted">{formatRand(q.initiationFee)}</td>
                      <td className="text-ink-muted">{formatRand(q.serviceFee)}</td>
                      <td className="text-ink-muted">{formatRand(q.interest)}</td>
                      <td className="text-right font-semibold">{formatRand(q.totalRepayable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-ink-faint">
            The initiation fee is the same for every amount, so smaller loans cost more as a percentage. Borrow only what you need.{" "}
            <Link href="/costs" className="link-more text-sm">
              Full cost breakdown
            </Link>
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <h2 className="text-center text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Ready in ten minutes.</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-muted sm:text-xl">Check you qualify. Have your documents to hand.</p>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              { t: "You can apply if", items: ELIGIBILITY },
              { t: "You'll need", items: REQUIREMENTS },
            ].map((c) => (
              <div key={c.t} className="glass p-8 sm:p-10">
                <h3 className="text-2xl font-semibold tracking-[-0.02em]">{c.t}</h3>
                <ul className="mt-6 space-y-3.5 text-[17px] text-ink-muted">
                  {c.items.map((e) => (
                    <li key={e} className="flex gap-3">
                      <Check /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="pb-20 sm:pb-28">
        <div className="container-x grid gap-4 md:grid-cols-3">
          {[
            { t: "Affordable. Or not at all.", b: "We check your income and expenses before every loan. If the repayment would stretch you too far, we won't lend." },
            { t: "Private by default.", b: "ID and bank numbers encrypted. POPIA-compliant. We never sell your data or ask for banking passwords." },
            { t: "Help when you need it.", b: "Struggling to repay? Talk to us before payday. You can also approach a registered debt counsellor." },
          ].map((c) => (
            <div key={c.t} className="glass p-8">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">{c.t}</h3>
              <p className="mt-3 text-[17px] leading-snug text-ink-muted">{c.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href="/responsible-lending" className="link-more">
            Our responsible lending commitments
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="pb-8">
        <div className="container-x max-w-3xl">
          <h2 className="text-center text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Questions? Answered.</h2>
          <div className="mt-12">
            <FaqList items={FAQS.filter((f) => f.home)} />
          </div>
          <p className="mt-6 text-center">
            <Link href="/faq" className="link-more">
              All questions
            </Link>
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

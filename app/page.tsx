import Link from "next/link";
import { Calculator } from "@/components/calculator";
import { PaydayHero } from "@/components/payday-hero";
import { POSTERS, Poster } from "@/components/poster";
import { Check, CtaBand, FaqList } from "@/components/ui";
import { COMPANY, PRODUCT } from "@/lib/config";
import { ELIGIBILITY, FAQS, REQUIREMENTS, STEPS } from "@/lib/content";
import { addDays, defaultPayday, todaySA } from "@/lib/dates";
import { formatRand, representativeExamples } from "@/lib/pricing";

const CHARGES: { big: string; name: string; body: string; from: string; to: string; ink?: string }[] = [
  { big: "R165", name: "Initiation fee", body: "Once, when your loan is set up. The same for every amount up to R1,000.", from: "#FFB020", to: "#FF7A45", ink: "#1F1000" },
  { big: "R2", name: "Service fee per day", body: "R60 a month, charged only for the days you have the money.", from: "#4F46E5", to: "#0EA5A4" },
  { big: "5%", name: "Interest per month", body: "On the amount you borrow. Drops to 3% for later loans in the same year.", from: "#E0367A", to: "#7C3AED" },
];

export default function HomePage() {
  const today = todaySA();
  const due = defaultPayday(today, PRODUCT.minDays, PRODUCT.maxDays);
  const examples = representativeExamples(today, addDays(today, 30));
  const r1000 = examples[3];

  return (
    <>
      <PaydayHero exampleTotal={formatRand(r1000.totalRepayable)} />

      {/* Uses marquee */}
      <section aria-labelledby="uses" className="relative py-16 sm:py-24">
        <div className="container-x" data-reveal>
          <h2 id="uses" className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            For the bills that can&rsquo;t wait for the 25th.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">
            A short-term advance for one-off gaps — not for everyday spending or paying off other debt.
          </p>
        </div>
        <div className="group relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[...POSTERS, ...POSTERS].map((p, i) => (
              <Poster key={`${p.key}-${i}`} spec={p} className="w-44 shrink-0 sm:w-56" />
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="relative scroll-mt-16 overflow-hidden py-16 sm:py-24">
        <div aria-hidden className="pointer-events-none absolute left-[60%] top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_200deg,#10B981,#4F46E5,#E0367A,#FFB020,#10B981)] opacity-25 blur-[110px]" />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div data-reveal>
            <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">See the whole cost first.</h2>
            <p className="mt-5 max-w-md text-lg text-ink-muted">
              Slide to your amount and pick your payday. The total you see is what one debit order collects — nothing is added if you
              pay on time.
            </p>
            <ul className="mt-8 space-y-3 text-ink">
              {["No credit life insurance or hidden extras", "Settle early and pay less", "A real person reviews every application"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal className="relative rounded-[32px] bg-gradient-to-br from-ember/60 via-volt/30 to-berry/50 p-px">
            <div className="rounded-[31px] bg-night-800/95 backdrop-blur">
              <Calculator today={today} defaultDue={due} />
            </div>
          </div>
        </div>
      </section>

      {/* Steps rail */}
      <section aria-labelledby="steps" className="py-16 sm:py-24">
        <div className="container-x flex flex-wrap items-end justify-between gap-4" data-reveal>
          <h2 id="steps" className="max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
            From application to payout in five steps.
          </h2>
          <Link href="/how-it-works" className="link-more">
            How it works
          </Link>
        </div>
        <ol data-reveal className="container-x mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="glass relative w-[78vw] max-w-sm shrink-0 snap-start overflow-hidden p-6 sm:w-80 lg:w-auto"
            >
              <span aria-hidden className="absolute -right-3 -top-6 font-display text-[7rem] font-bold leading-none text-ink/[0.05]">
                {i + 1}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember font-display text-sm font-semibold text-night">
                {i + 1}
              </span>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Costs */}
      <section aria-labelledby="costs" className="py-16 sm:py-24">
        <div className="container-x">
          <div data-reveal>
            <h2 id="costs" className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">Three charges, each capped by the National Credit Act.</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">No application fee. No insurance. No penalty for paying early, and no penalty interest if you pay late.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {CHARGES.map((c, i) => (
              <div
                key={c.name}
                data-reveal
                style={{ transitionDelay: `${i * 90}ms`, background: `linear-gradient(150deg, ${c.from}, ${c.to})`, color: c.ink ?? "#fff" }}
                className="relative isolate overflow-hidden rounded-[28px] p-7 sm:p-8"
              >
                <svg aria-hidden viewBox="0 0 200 200" className="absolute -right-10 -top-10 -z-10 h-56 w-56 opacity-30">
                  {[20, 40, 60, 80, 100].map((r) => (
                    <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="1.2" />
                  ))}
                </svg>
                <p className="font-display text-6xl font-semibold tracking-[-0.05em]">{c.big}</p>
                <p className="mt-8 text-lg font-semibold">{c.name}</p>
                <p className="mt-1 text-[15px] leading-relaxed opacity-90">{c.body}</p>
              </div>
            ))}
          </div>

          <div data-reveal className="glass mt-6 overflow-hidden">
            <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 pt-6">
              <p className="font-semibold">What you&rsquo;d repay after 30 days</p>
              <p className="text-sm text-ink-faint">First loan this year</p>
            </div>
            <div className="overflow-x-auto px-3 pb-3">
              <table className="table-x mt-3 min-w-[520px]">
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
                      <td className="font-semibold">{formatRand(q.principal, { cents: false })}</td>
                      <td className="text-ink-muted">{formatRand(q.initiationFee)}</td>
                      <td className="text-ink-muted">{formatRand(q.serviceFee)}</td>
                      <td className="text-ink-muted">{formatRand(q.interest)}</td>
                      <td className="text-right font-semibold text-ember-300">{formatRand(q.totalRepayable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-5 text-sm text-ink-faint">
            The initiation fee is fixed, so smaller loans cost more as a share of the amount. Borrow only what you need.{" "}
            <Link href="/costs" className="text-ember-300 underline underline-offset-2">
              Full cost breakdown
            </Link>
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section aria-labelledby="eligibility" className="py-16 sm:py-24">
        <div className="container-x">
          <h2 id="eligibility" data-reveal className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            Check you qualify, then gather three documents.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              { t: "You can apply if", items: ELIGIBILITY, href: "/eligibility", link: "Who can apply" },
              { t: "Have these ready", items: REQUIREMENTS, href: "/eligibility", link: "Document tips" },
            ].map((c, i) => (
              <div key={c.t} data-reveal style={{ transitionDelay: `${i * 90}ms` }} className="glass flex flex-col p-7 sm:p-9">
                <h3 className="text-xl font-semibold">{c.t}</h3>
                <ul className="mt-6 flex-1 space-y-3.5 text-ink-muted">
                  {c.items.map((e) => (
                    <li key={e} className="flex gap-3">
                      <Check /> {e}
                    </li>
                  ))}
                </ul>
                <Link href={c.href} className="link-more mt-6 text-base">
                  {c.link}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section aria-labelledby="trust" className="py-16 sm:py-24">
        <div className="container-x">
          <h2 id="trust" data-reveal className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            We lend only what you can repay.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { t: "Affordability first", b: "We check your income, expenses and credit record before every loan. If the repayment would stretch you, we decline and tell you why." },
              { t: "Your details stay private", b: "ID and bank numbers are encrypted. We follow POPIA, never sell your data and never ask for your banking password." },
              { t: "Help if things change", b: "Can't pay on payday? Talk to us beforehand. You also have the right to apply to a registered debt counsellor." },
            ].map((c, i) => (
              <div key={c.t} data-reveal style={{ transitionDelay: `${i * 90}ms` }} className="glass p-7">
                <h3 className="text-lg font-semibold">{c.t}</h3>
                <p className="mt-3 leading-relaxed text-ink-muted">{c.b}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-ink-faint">
            Airdvance is a registered credit provider ({COMPANY.ncrcp}).{" "}
            <Link href="/responsible-lending" className="text-ember-300 underline underline-offset-2">
              Our responsible lending commitments
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div data-reveal>
            <h2 id="faq" className="text-3xl font-semibold leading-tight sm:text-5xl">Questions people ask first.</h2>
            <p className="mt-4 text-ink-muted">
              More in the{" "}
              <Link href="/faq" className="text-ember-300 underline underline-offset-2">
                full FAQ
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="text-ember-300 underline underline-offset-2">
                contact us
              </Link>
              .
            </p>
          </div>
          <div data-reveal>
            <FaqList items={FAQS.filter((f) => f.home)} />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

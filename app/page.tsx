import Link from "next/link";
import { Calculator } from "@/components/calculator";
import { PaydayHero } from "@/components/payday-hero";
import { Check, CtaBand, FaqList } from "@/components/ui";
import { PRODUCT } from "@/lib/config";
import { ELIGIBILITY, FAQS, REQUIREMENTS, STEPS } from "@/lib/content";
import { defaultPayday, todaySA } from "@/lib/dates";

const CHARGES: { big: string; name: string; from: string; to: string; ink?: string }[] = [
  { big: "R165", name: "Once-off initiation fee", from: "#FFB020", to: "#FF7A45", ink: "#1F1000" },
  { big: "R2", name: "Service fee per day", from: "#4F46E5", to: "#0EA5A4" },
  { big: "5%", name: "Interest per month", from: "#E0367A", to: "#7C3AED" },
];

export default function HomePage() {
  const today = todaySA();
  const due = defaultPayday(today, PRODUCT.minDays, PRODUCT.maxDays);

  return (
    <>
      <PaydayHero />


      {/* Calculator */}
      <section id="calculator" className="relative scroll-mt-16 overflow-hidden py-16 sm:py-24">
        <div aria-hidden className="pointer-events-none absolute left-[60%] top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_200deg,#10B981,#4F46E5,#E0367A,#FFB020,#10B981)] opacity-25 blur-[110px]" />
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div data-reveal>
            <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">See your total first.</h2>
            <p className="mt-4 max-w-sm text-lg text-ink-muted">What you see is what you repay. No extras.</p>
          </div>
          <div data-reveal className="relative rounded-[32px] bg-gradient-to-br from-ember/60 via-volt/30 to-berry/50 p-px">
            <div className="rounded-[31px] bg-night-800/95 backdrop-blur">
              <Calculator today={today} defaultDue={due} />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section aria-labelledby="steps" className="py-16 sm:py-24">
        <div className="container-x flex flex-wrap items-end justify-between gap-4" data-reveal>
          <h2 id="steps" className="text-3xl font-semibold leading-tight sm:text-5xl">
            How it works
          </h2>
          <Link href="/how-it-works" className="link-more">
            Details
          </Link>
        </div>
        <ol data-reveal className="container-x mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible">
          {STEPS.map((s, i) => (
            <li key={s.title} className="glass w-[70vw] max-w-xs shrink-0 snap-start p-6 sm:w-72 lg:w-auto">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember font-display text-sm font-semibold text-night">{i + 1}</span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Costs */}
      <section aria-labelledby="costs" className="py-16 sm:py-24">
        <div className="container-x">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="costs" className="max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
              Three charges. Capped by law.
            </h2>
            <Link href="/costs" className="link-more">
              All fees
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
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
                <p className="mt-6 text-lg font-semibold">{c.name}</p>
              </div>
            ))}
          </div>
          <p data-reveal className="mt-5 text-sm text-ink-faint">
            No insurance, application fee or early-settlement penalty.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section aria-labelledby="eligibility" className="py-16 sm:py-24">
        <div className="container-x">
          <div data-reveal className="glass grid gap-10 p-7 sm:p-10 md:grid-cols-2">
            <div>
              <h2 id="eligibility" className="text-2xl font-semibold sm:text-3xl">
                Who can apply
              </h2>
              <ul className="mt-6 space-y-3 text-ink-muted">
                {ELIGIBILITY.map((e) => (
                  <li key={e} className="flex gap-3">
                    <Check /> {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold sm:text-3xl">What you&rsquo;ll need</h3>
              <ul className="mt-6 space-y-3 text-ink-muted">
                {REQUIREMENTS.map((e) => (
                  <li key={e} className="flex gap-3">
                    <Check /> {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div data-reveal>
            <h2 id="faq" className="text-3xl font-semibold leading-tight sm:text-5xl">Questions</h2>
            <Link href="/faq" className="link-more mt-4">
              All FAQs
            </Link>
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

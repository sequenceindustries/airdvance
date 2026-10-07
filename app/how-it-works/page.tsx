import Link from "next/link";
import { CtaBand, PageHero } from "@/components/ui";
import { STEPS } from "@/lib/content";

export const metadata = { title: "How it works" };

const DETAILS = [
  ["What we ask", "Your ID number, address, employer, net monthly income, monthly expenses and existing debt repayments, and the bank account the money should go into."],
  ["What we check", "That you are who you say you are, that your income matches your payslip and bank statements, your credit record, and that the repayment still leaves you enough to live on."],
  ["What you sign", "A pre-agreement statement and quotation, then a short-term credit agreement showing the amount, every charge, the total and the repayment date. You sign online by typing your name."],
  ["How you repay", "One DebiCheck debit order on your payday. You confirm the mandate with your bank, so we can only collect the amount and date you approved."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From application to payout, step by step"
        intro="Everything happens online, and a real person reviews every application. Here's exactly what to expect."
      />
      <section className="container-x">
        <ol className="relative space-y-4 border-l border-ink/10 pl-6 sm:pl-10">
          {STEPS.map((s, i) => (
            <li key={s.title} className="glass relative p-5 sm:p-6">
              <span className="absolute -left-[37px] top-6 flex h-6 w-6 items-center justify-center rounded-full bg-ember text-xs font-bold text-white sm:-left-[53px]">
                {i + 1}
              </span>
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="container-x mt-20 grid gap-4 md:grid-cols-2">
        {DETAILS.map(([t, b]) => (
          <div key={t} className="glass p-6">
            <h3 className="text-lg font-semibold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b}</p>
          </div>
        ))}
      </section>
      <section className="container-x mt-12">
        <div className="glass p-6 text-sm leading-relaxed text-ink-muted">
          <h3 className="text-lg font-semibold text-ink">If we can't approve you</h3>
          <p className="mt-2">
            We'll tell you the main reason and, if your credit record played a part, which credit bureau we used so you
            can request your free report. Declined applications don't cost anything. See{" "}
            <Link href="/responsible-lending" className="text-ember-300 underline">responsible lending</Link>.
          </p>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

import Link from "next/link";
import { Check, CtaBand, PageHero } from "@/components/ui";
import { ELIGIBILITY, REQUIREMENTS } from "@/lib/content";

export const metadata = { title: "Who can apply" };

export default function EligibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Who can apply"
        title="Check before you apply"
        intro="Meeting these criteria means you can apply — it doesn't guarantee approval. Every application gets a full affordability assessment."
      />
      <section className="container-x grid gap-4 md:grid-cols-2">
        {[
          { t: "You can apply if", items: ELIGIBILITY },
          { t: "Documents you'll upload", items: REQUIREMENTS },
        ].map((c) => (
          <div key={c.t} className="glass p-6 sm:p-8">
            <h2 className="text-xl font-semibold">{c.t}</h2>
            <ul className="mt-5 space-y-3.5 text-ink-muted">
              {c.items.map((i) => (
                <li key={i} className="flex gap-3"><Check /> {i}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section className="container-x mt-12 grid gap-4 md:grid-cols-3">
        {[
          ["Clear photos are fine", "PDFs or photos taken on your phone work, up to 8 MB each. Make sure all four corners and every word are readable."],
          ["Bank statements", "Download them from your banking app as PDFs. They must be in your name and cover the last 3 months."],
          ["Self-employed or paid in cash?", "We can't help right now — we need income we can verify on a payslip and in your bank account."],
        ].map(([t, b]) => (
          <div key={t} className="glass p-6">
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b}</p>
          </div>
        ))}
      </section>
      <p className="container-x mt-8 text-sm text-ink-muted">
        Under debt review or struggling with existing debt? Please don't take on more credit — see our{" "}
        <Link href="/responsible-lending" className="text-ember-300 underline">responsible lending page</Link> for free help.
      </p>
      <CtaBand />
    </>
  );
}

import { Check, CtaBand, PageHero } from "@/components/ui";
import { ELIGIBILITY, REQUIREMENTS } from "@/lib/content";

export const metadata = { title: "Who can apply" };

export default function EligibilityPage() {
  return (
    <>
      <PageHero title="Who can apply" intro="Meeting these lets you apply. Approval depends on affordability." />
      <section className="container-x grid gap-4 md:grid-cols-2">
        {[
          { t: "You must be", items: ELIGIBILITY },
          { t: "You'll upload", items: REQUIREMENTS },
        ].map((c) => (
          <div key={c.t} data-reveal className="glass p-7 sm:p-9">
            <h2 className="text-xl font-semibold">{c.t}</h2>
            <ul className="mt-5 space-y-3 text-ink-muted">
              {c.items.map((i) => (
                <li key={i} className="flex gap-3">
                  <Check /> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <p className="container-x mt-6 text-sm text-ink-faint">PDFs or clear phone photos work. Self-employed or paid in cash? We can&rsquo;t help yet.</p>
      <CtaBand />
    </>
  );
}

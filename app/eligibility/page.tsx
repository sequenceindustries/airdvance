import { Check, CtaBand, PageHero, RelatedLinks } from "@/components/ui";
import { ELIGIBILITY, REQUIREMENTS } from "@/lib/content";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/eligibility");

export default function EligibilityPage() {
  return (
    <>
      <PageHero title="Who can apply" intro="Meeting these lets you apply. It doesn't guarantee approval: every application gets an affordability and credit check." />
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
      <RelatedLinks
        links={[
          { href: "/costs", label: "Costs and repayment", note: "See the total before you apply." },
          { href: "/how-it-works", label: "How it works", note: "What happens after you apply." },
          { href: "/responsible-lending", label: "Responsible lending", note: "Borrowing safely." },
        ]}
      />
      <CtaBand />
    </>
  );
}

import { CtaBand, PageHero, RelatedLinks } from "@/components/ui";
import { STEPS } from "@/lib/content";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/how-it-works");

export default function HowItWorksPage() {
  return (
    <>
      <PageHero title="How it works" intro="Five steps, all online. Applying doesn't guarantee approval." />
      <section className="container-x">
        <ol className="grid gap-4 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="glass p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember font-display text-sm font-semibold text-night">{i + 1}</span>
              <h2 className="mt-5 text-lg font-semibold">{s.title}</h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
        <p data-reveal className="mt-8 max-w-2xl text-ink-muted">
          If we can&rsquo;t approve you, we&rsquo;ll tell you the main reason. It costs nothing to apply.
        </p>
      </section>
      <RelatedLinks
        links={[
          { href: "/costs", label: "Costs and repayment", note: "Every charge, with worked examples." },
          { href: "/eligibility", label: "Who can apply", note: "Requirements and documents." },
          { href: "/faq", label: "Questions", note: "Payout, early settlement and more." },
        ]}
      />
      <CtaBand />
    </>
  );
}

import { CtaBand, FaqList, PageHero, RelatedLinks } from "@/components/ui";
import { FAQS } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/faq");

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <PageHero title="Frequently asked questions" intro="Short answers about borrowing, costs and repayment." />
      <section className="container-x max-w-3xl">
        <FaqList items={FAQS} />
      </section>
      <RelatedLinks
        links={[
          { href: "/costs", label: "Costs and repayment", note: "Every charge, with worked examples." },
          { href: "/eligibility", label: "Who can apply", note: "Requirements and documents." },
          { href: "/contact", label: "Contact us", note: "Ask us anything else." },
        ]}
      />
      <CtaBand />
    </>
  );
}

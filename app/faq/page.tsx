import { CtaBand, FaqList, PageHero } from "@/components/ui";
import { FAQS } from "@/lib/content";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" intro="Straight answers about borrowing with Airdvance." />
      <section className="container-x max-w-3xl">
        <FaqList items={FAQS} />
      </section>
      <CtaBand />
    </>
  );
}

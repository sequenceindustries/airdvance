import { longDate, page } from "@/lib/site";
import { PageHero } from "./ui";

export function LegalPage({ title, intro, path, children }: { title: string; intro?: string; path: string; children: React.ReactNode }) {
  const updated = longDate(page(path).updated);
  return (
    <>
      <PageHero eyebrow="Airdvance" title={title} intro={intro} />
      <article className="container-x max-w-3xl">
        <p className="text-xs text-ink-faint">Last updated {updated}</p>
        <div className="prose-legal">{children}</div>
      </article>
    </>
  );
}

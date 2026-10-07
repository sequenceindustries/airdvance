import { PageHero } from "./ui";

export function LegalPage({ title, intro, updated, children }: { title: string; intro?: string; updated: string; children: React.ReactNode }) {
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

import { Glow } from "./ui";

export function AuthShell({ title, intro, children, footer }: { title: string; intro?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="relative">
      <Glow />
      <div className="container-x relative flex justify-center py-12 sm:py-20">
        <div className="glass w-full max-w-md p-6 sm:p-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          {intro && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{intro}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-ink/10 pt-5 text-sm text-ink-muted">{footer}</div>}
        </div>
      </div>
    </section>
  );
}

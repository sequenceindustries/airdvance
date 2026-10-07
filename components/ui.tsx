import Link from "next/link";
import clsx from "clsx";

export function Glow({ className }: { className?: string }) {
  // Quiet backdrop: a faint dot grid fading out, no colour wash.
  return (
    <div aria-hidden className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(18,22,27,.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={clsx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">{intro}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <section className="relative">
      <Glow />
      <div className="container-x relative pb-10 pt-14 sm:pb-14 sm:pt-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">{intro}</p>}
      </div>
    </section>
  );
}

export function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={clsx("h-5 w-5 shrink-0", className)} fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" className="fill-mint/15" />
      <path d="m6 10.2 2.6 2.6L14 7.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-mint" />
    </svg>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-ink/[0.07] rounded-2xl border border-ink/[0.08] bg-night-800">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-1 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium">
            {f.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink-muted transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="container-x mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <div className="relative">
          <h2 className="mx-auto max-w-xl text-3xl font-semibold sm:text-4xl">Know your total before you borrow.</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
            Applying takes about 10 minutes. Have your ID, latest payslip and 3 months of bank statements ready.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/apply" className="btn-primary px-7">
              Start your application
            </Link>
            <Link href="/costs" className="btn border border-white/25 px-7 text-white hover:bg-white/10">
              See the full costs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "border-volt/40 bg-volt/10 text-volt-300",
  MORE_INFO_REQUIRED: "border-amber/40 bg-amber/10 text-amber",
  APPROVED: "border-mint/40 bg-mint/10 text-mint-300",
  DECLINED: "border-rose/40 bg-rose/10 text-rose-300",
  WITHDRAWN: "border-ink/15 bg-ink/5 text-ink-muted",
  OFFERED: "border-amber/40 bg-amber/10 text-amber",
  ACCEPTED: "border-volt/40 bg-volt/10 text-volt-300",
  ACTIVE: "border-mint/40 bg-mint/10 text-mint-300",
  ARREARS: "border-rose/40 bg-rose/10 text-rose-300",
  SETTLED: "border-ink/15 bg-ink/5 text-ink-muted",
  EXPIRED: "border-ink/15 bg-ink/5 text-ink-muted",
  CANCELLED: "border-ink/15 bg-ink/5 text-ink-muted",
  WRITTEN_OFF: "border-rose/40 bg-rose/10 text-rose-300",
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Under review",
  MORE_INFO_REQUIRED: "Info needed",
  APPROVED: "Approved",
  DECLINED: "Declined",
  WITHDRAWN: "Withdrawn",
  OFFERED: "Offer ready",
  ACCEPTED: "Awaiting payout",
  ACTIVE: "Active",
  ARREARS: "In arrears",
  SETTLED: "Settled",
  EXPIRED: "Offer expired",
  CANCELLED: "Cancelled",
  WRITTEN_OFF: "Written off",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={clsx("badge", STATUS_STYLES[status] ?? STATUS_STYLES.WITHDRAWN)}>{STATUS_LABELS[status] ?? status}</span>;
}

export function Alert({ tone = "info", children }: { tone?: "info" | "error" | "success" | "warn"; children: React.ReactNode }) {
  const styles = {
    info: "border-volt/30 bg-volt/10 text-volt-300",
    error: "border-rose/30 bg-rose/10 text-rose-300",
    success: "border-mint/30 bg-mint/10 text-mint-300",
    warn: "border-amber/30 bg-amber/10 text-amber",
  }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className={clsx("rounded-xl border px-4 py-3 text-sm", styles)}>{children}</div>;
}

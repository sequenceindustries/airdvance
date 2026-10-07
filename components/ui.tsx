import Link from "next/link";
import clsx from "clsx";

/** Kept for API compatibility — the design now uses plain backgrounds. */
export function Glow(_: { className?: string }) {
  return null;
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
      <h2 className="mt-2 text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-snug text-ink-muted sm:text-xl">{intro}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <section className="relative">
      <div className="container-x relative pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
        {eyebrow && <p className="text-lg font-semibold text-ink-muted sm:text-xl">{eyebrow}</p>}
        <h1 className="mx-auto mt-2 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-7xl">{title}</h1>
        {intro && <p className="mx-auto mt-6 max-w-2xl text-lg leading-snug text-ink-muted sm:text-2xl">{intro}</p>}
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
    <div className="divide-y divide-ink/[0.08] rounded-3xl bg-night-800">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-1 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold">
            {f.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink-muted transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-6 pr-8 text-[15px] leading-relaxed text-ink-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="container-x mt-20 sm:mt-28">
      <div className="relative overflow-hidden rounded-3xl bg-black px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Know your total. Then borrow.</h2>
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

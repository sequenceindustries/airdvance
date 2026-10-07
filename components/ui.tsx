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
    <div data-reveal className={clsx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="text-sm font-medium text-ember-300">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-snug text-ink-muted sm:text-xl">{intro}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,.22),rgba(79,70,229,.1)_60%,transparent)] blur-2xl" />
      <div className="container-x relative pb-12 pt-16 sm:pb-16 sm:pt-24">
        {eyebrow && <p className="text-sm font-medium text-ember-300">{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl animate-rise text-4xl font-semibold leading-[1.05] sm:text-6xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-ink-muted [animation-delay:.1s] sm:text-xl">{intro}</p>}
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
    <div className="divide-y divide-ink/[0.08] rounded-3xl border border-ink/[0.07] bg-night-800">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-1 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold">
            {f.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink-muted transition-transform duration-300 group-open:rotate-45 group-open:border-ember group-open:text-ember">
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
    <section className="container-x mt-24 sm:mt-32" data-reveal>
      <div className="relative isolate overflow-hidden rounded-[36px] px-6 py-14 text-center sm:px-12 sm:py-20" style={{ background: "linear-gradient(135deg,#047857 0%,#0E7490 35%,#4338CA 70%,#BE185D 100%)" }}>
        <svg aria-hidden viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 -z-10 h-full w-full opacity-30">
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx="200" cy="230" r={30 + i * 26} fill="none" stroke="white" strokeWidth="1" />
          ))}
        </svg>
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-5xl">Know your total before you borrow.</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/85">
          Applying takes about 10 minutes. Have your ID, latest payslip and 3 months of bank statements ready.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/apply" className="btn bg-white px-7 py-3 text-base text-night hover:bg-white/90">
            Start my application
          </Link>
          <Link href="/costs" className="btn border border-white/50 px-7 py-3 text-base text-white hover:bg-white/10">
            See every fee
          </Link>
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

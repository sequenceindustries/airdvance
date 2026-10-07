import clsx from "clsx";

/** Airdvance mark: an emerald tile with an upward "advance" arrow. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={clsx("shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#0B7A55" />
      <path d="M10.5 21.5 21.5 10.5M13 10.5h8.5V19" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "sm" }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark className={size === "sm" ? "h-6 w-6" : "h-7 w-7"} />
      <span className={clsx("font-display font-bold tracking-[-0.04em] text-ink", size === "sm" ? "text-lg" : "text-xl")}>
        airdvance
      </span>
    </span>
  );
}

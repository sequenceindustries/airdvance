import clsx from "clsx";

/** Airdvance mark: an emerald tile with an upward "advance" arrow. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={clsx("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="ad-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6EE7B7" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ad-mark)" />
      <path d="M10.5 21.5 21.5 10.5M13 10.5h8.5V19" fill="none" stroke="#04150E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "sm" }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark className={size === "sm" ? "h-6 w-6" : "h-7 w-7"} />
      <span className={clsx("font-display font-semibold tracking-[-0.04em] text-ink", size === "sm" ? "text-base" : "text-lg")}>
        airdvance
      </span>
    </span>
  );
}

import clsx from "clsx";

/** Airdvance wordmark. */
export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "sm" }) {
  return (
    <span className={clsx("font-display font-extrabold tracking-[-0.04em] text-ink", size === "sm" ? "text-xl" : "text-2xl", className)}>
      airdvance<span className="text-ember">.</span>
    </span>
  );
}

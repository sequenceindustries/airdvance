import { isDemoMessaging } from "@/lib/messaging";
import { isDemoPayments } from "@/lib/payments";

/** Visible whenever simulated providers are active, so nobody mistakes the site for live lending. */
export function DemoBanner() {
  const parts: string[] = [];
  if (isDemoPayments()) parts.push("no real money is paid out or collected");
  if (isDemoMessaging()) parts.push("PINs are shown on screen instead of sent by SMS");
  if (parts.length === 0 || process.env.HIDE_DEMO_BANNER === "true") return null;
  return (
    <div className="border-b border-amber/30 bg-amber/10 px-4 py-2 text-center text-xs text-amber">
      <strong className="font-semibold">Demo mode:</strong> {parts.join(" and ")}.
    </div>
  );
}

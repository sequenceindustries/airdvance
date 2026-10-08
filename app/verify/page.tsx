import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { VerifyForm } from "@/components/auth-forms";
import { requireUser, safeNext } from "@/lib/auth";
import { smsEnabled } from "@/lib/messaging";
import { displayMobile } from "@/lib/sa";

export const metadata = { title: "Confirm your number" };

export default async function VerifyPage({ searchParams }: { searchParams: { next?: string; send?: string } }) {
  const user = await requireUser("/verify");
  const next = safeNext(searchParams.next, "/apply");
  if (user.mobile_verified_at || !smsEnabled()) redirect(next);
  return (
    <AuthShell
      title="Confirm your number"
      intro="Enter the PIN we sent you. Never share it."
    >
      <VerifyForm next={next} autoSend={searchParams.send === "1"} mobile={displayMobile(user.mobile)} />
    </AuthShell>
  );
}

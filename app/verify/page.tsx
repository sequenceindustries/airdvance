import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { VerifyForm } from "@/components/auth-forms";
import { requireUser, safeNext } from "@/lib/auth";
import { displayMobile } from "@/lib/sa";

export const metadata = { title: "Confirm your number" };

export default async function VerifyPage({ searchParams }: { searchParams: { next?: string; send?: string } }) {
  const user = await requireUser("/verify");
  const next = safeNext(searchParams.next, "/apply");
  if (user.mobile_verified_at) redirect(next);
  return (
    <AuthShell
      title="Confirm your cellphone number"
      intro="We use your number to keep your account secure and to contact you about your application. Airdvance will never ask you for this PIN."
    >
      <VerifyForm next={next} autoSend={searchParams.send === "1"} mobile={displayMobile(user.mobile)} />
    </AuthShell>
  );
}

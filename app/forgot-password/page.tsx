import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/auth-forms";
import { smsEnabled } from "@/lib/messaging";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  const sms = smsEnabled();
  return (
    <AuthShell
      title="Reset your password"
      intro={sms ? "We'll send a PIN to your cellphone." : "Contact us and we'll reset it for you after confirming it's you."}
      footer={<Link href="/login" className="text-ember-300 hover:underline">Back to log in</Link>}
    >
      {sms ? (
        <ForgotPasswordForm />
      ) : (
        <Link href="/contact" className="btn-primary w-full py-3.5">
          Contact us
        </Link>
      )}
    </AuthShell>
  );
}

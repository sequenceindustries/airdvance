import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      intro="We'll send a PIN to the cellphone number on your account."
      footer={<Link href="/login" className="text-ember-300 hover:underline">Back to log in</Link>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

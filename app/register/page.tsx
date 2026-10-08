import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create an account" };

export default async function RegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell
      title="Create your account"
      intro="Takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`} className="font-medium text-ember-300 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm next={searchParams.next} />
    </AuthShell>
  );
}

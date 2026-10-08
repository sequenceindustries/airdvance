import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser, safeNext } from "@/lib/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : safeNext(searchParams.next, "/dashboard"));
  return (
    <AuthShell
      title="Welcome back"
            footer={
        <>
          New to Airdvance?{" "}
          <Link href={`/register${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`} className="font-medium text-ember-300 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={searchParams.next} />
    </AuthShell>
  );
}

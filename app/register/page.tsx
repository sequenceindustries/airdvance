import Link from "next/link";
import { signUp } from "@/lib/actions/auth";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-20">
      <h1 className="font-display text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-slate-300">Takes about a minute. You can apply for a device right after.</p>
      {searchParams.error && (
        <p className="mt-4 rounded-md bg-alert-light px-3 py-2 text-sm text-alert-dark">{searchParams.error}</p>
      )}

      <form action={signUp} className="mt-8 flex flex-col gap-4">
        <label className="text-sm">
          Full name
          <input
            name="full_name"
            required
            className="input mt-1"
          />
        </label>
        <label className="text-sm">
          Mobile number
          <input
            name="mobile"
            required
            className="input mt-1"
          />
        </label>
        <label className="text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="input mt-1"
          />
        </label>
        <label className="text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="input mt-1"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-brand py-3 font-medium text-white hover:bg-brand-dark focus-ring"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-dark">
          Log in
        </Link>
      </p>
    </div>
  );
}

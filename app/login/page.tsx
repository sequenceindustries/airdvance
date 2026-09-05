import Link from "next/link";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-20">
      <h1 className="font-display text-3xl">Log in</h1>
      <p className="mt-2 text-sm text-slate-300">
        Demo accounts: <code className="text-xs">admin@airdvance.demo</code> /{" "}
        <code className="text-xs">john.doe@airdvance.demo</code>, password{" "}
        <code className="text-xs">Airdvance!Demo123</code>
      </p>
      {searchParams.error && (
        <p className="mt-4 rounded-md bg-alert-light px-3 py-2 text-sm text-alert-dark">{searchParams.error}</p>
      )}

      <form action={signIn} className="mt-8 flex flex-col gap-4">
        {searchParams.next && <input type="hidden" name="next" value={searchParams.next} />}
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
            className="input mt-1"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-brand py-3 font-medium text-white hover:bg-brand-dark focus-ring"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        New to airdvance?{" "}
        <Link href="/register" className="font-medium text-accent hover:text-accent-dark">
          Create an account
        </Link>
      </p>
    </div>
  );
}

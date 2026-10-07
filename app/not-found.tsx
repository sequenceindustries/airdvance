import Link from "next/link";
import { Glow } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="relative">
      <Glow />
      <div className="container-x relative py-28 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-semibold">We couldn't find that page</h1>
        <p className="mt-3 text-ink-muted">It may have moved, or the link may be wrong.</p>
        <Link href="/" className="btn-primary mt-8">Back to home</Link>
      </div>
    </section>
  );
}

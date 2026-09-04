import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";

async function getFromPrice(productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("rental_plans")
    .select("monthly_payment")
    .eq("product_id", productId)
    .eq("status", "ACTIVE")
    .order("monthly_payment", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.monthly_payment as number | undefined;
}

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);
  const withPrices = await Promise.all(
    featured.map(async (p) => ({ product: p, fromPrice: await getFromPrice(p.id) })),
  );

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl leading-[1.1] text-ink md:text-6xl">
            Get the device you need now. Pay over time. Own it.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-300">
            Choose a smartphone or tablet and spread the cost over an agreed rental
            term. When you've made every payment, own it for as little as R10.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark focus-ring"
            >
              Shop devices
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-md border border-white/20 px-6 py-3 font-medium text-ink hover:bg-white/10 focus-ring"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { href: "/shop/smartphones", label: "Smartphones", copy: "The latest and most dependable phones." },
            { href: "/shop/tablets", label: "Tablets", copy: "For study, streaming and creative work." },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-lg border border-white/10 bg-surface p-6 transition hover:border-white/30 hover:shadow-sm"
            >
              <p className="font-display text-xl">{c.label}</p>
              <p className="mt-1 text-sm text-slate-300">{c.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured devices */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl">Featured devices</h2>
          <Link href="/shop" className="text-sm font-medium text-accent hover:text-accent-dark">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {withPrices.map(({ product, fromPrice }) => (
            <ProductCard key={product.id} product={product} fromPrice={fromPrice} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl">How Airdvance works</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {[
              { title: "Choose a device", copy: "Browse smartphones and tablets and pick a rental term that suits your budget." },
              { title: "Set up your debit order", copy: "We collect your first payment instantly — approval is automatic, no waiting for review." },
              { title: "We ship your device", copy: "As soon as your first payment clears, your device is on its way." },
              { title: "Buy it out for R10", copy: "Once your term is up, pay a small buyout fee from your dashboard and it's yours." },
            ].map((step) => (
              <div key={step.title}>
                <p className="font-display text-lg">{step.title}</p>
                <p className="mt-2 text-sm text-slate-300">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / reassurance */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-lg">Clear pricing</p>
            <p className="mt-2 text-sm text-slate-300">
              You always see your monthly payment and total payable up front — no hidden costs.
            </p>
          </div>
          <div>
            <p className="font-display text-lg">A real path to ownership</p>
            <p className="mt-2 text-sm text-slate-300">
              Every payment moves you closer to owning your device outright.
            </p>
          </div>
          <div>
            <p className="font-display text-lg">Support when you need it</p>
            <p className="mt-2 text-sm text-slate-300">
              Your dashboard always shows exactly where you stand and what's next.
            </p>
          </div>
        </div>
        <div className="mt-12 rounded-lg bg-ink px-8 py-10 text-paper">
          <p className="font-display text-2xl">Ready to get your next device?</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark focus-ring"
          >
            Shop devices
          </Link>
        </div>
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRentalPlans } from "@/lib/data/products";
import { PlanSelector } from "./plan-selector";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const plans = await getRentalPlans(product.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-slate-300">{product.brand}</span>
          )}
        </div>

        <div>
          <p className="text-sm text-slate-500">{product.brand}</p>
          <h1 className="font-display text-3xl">{product.name}</h1>
          <p className="mt-3 text-slate-300">{product.description}</p>

          <PlanSelector product={product} plans={plans} />

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="mb-3 font-medium text-ink">Specifications</p>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-slate-400">{key}</dt>
                  <dd className="text-slate-100">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-white/10 pt-8">
        <Link href="/how-it-works" className="text-sm font-medium text-accent hover:text-accent-dark">
          How buying it works →
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Product, RentalPlan } from "@/types/domain";
import { formatCurrency } from "@/lib/pricing";

export function ProductCard({ product, fromPrice }: { product: Product; fromPrice?: number }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-surface transition hover:border-white/30 hover:shadow-sm"
    >
      <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-lg text-slate-300">{product.brand}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs text-slate-500">{product.brand}</p>
        <p className="font-medium text-ink leading-snug">{product.name}</p>
        {fromPrice ? (
          <p className="mt-2 text-sm text-slate-300">
            From <span className="font-semibold text-ink">{formatCurrency(fromPrice)}</span>/month
          </p>
        ) : null}
      </div>
    </Link>
  );
}

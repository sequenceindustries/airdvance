import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import type { DeviceCategory } from "@/types/domain";

const categoryMap: Record<string, { key: DeviceCategory; label: string }> = {
  smartphones: { key: "SMARTPHONE", label: "Smartphones" },
  tablets: { key: "TABLET", label: "Tablets" },
  laptops: { key: "LAPTOP", label: "Laptops" },
};

async function fromPriceFor(productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("rental_plans")
    .select("monthly_payment")
    .eq("product_id", productId)
    .order("monthly_payment", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.monthly_payment as number | undefined;
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = categoryMap[params.category];
  if (!category) notFound();

  const products = await getProductsByCategory(category.key);
  const withPrices = await Promise.all(
    products.map(async (p) => ({ product: p, fromPrice: await fromPriceFor(p.id) })),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl">{category.label}</h1>
      <p className="mt-2 text-slate-600">{products.length} device{products.length === 1 ? "" : "s"} available</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {withPrices.map(({ product, fromPrice }) => (
          <ProductCard key={product.id} product={product} fromPrice={fromPrice} />
        ))}
      </div>
    </div>
  );
}

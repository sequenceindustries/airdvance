import Link from "next/link";
import { getProductsByCategory } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import type { DeviceCategory, Product } from "@/types/domain";

const categories: { key: DeviceCategory; label: string; href: string }[] = [
  { key: "SMARTPHONE", label: "Smartphones", href: "/shop/smartphones" },
  { key: "TABLET", label: "Tablets", href: "/shop/tablets" },
];

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

interface SectionData {
  key: DeviceCategory;
  label: string;
  href: string;
  products: (Product & { fromPrice?: number })[];
}

export default async function ShopPage() {
  const sections: SectionData[] = await Promise.all(
    categories.map(async (c) => {
      const products = (await getProductsByCategory(c.key)).slice(0, 4);
      const withPrices = await Promise.all(
        products.map(async (p) => ({ ...p, fromPrice: await fromPriceFor(p.id) })),
      );
      return { ...c, products: withPrices };
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl">Shop devices</h1>
      <p className="mt-2 max-w-xl text-slate-300">
        Pick a category to browse, or head straight to a device you already have in mind.
      </p>

      {sections.map((section) => (
        <section key={section.key} className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl">{section.label}</h2>
            <Link href={section.href} className="text-sm font-medium text-accent hover:text-accent-dark">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {section.products.map((product) => (
              <ProductCard key={product.id} product={product} fromPrice={product.fromPrice} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/pricing";

export default async function AdminCatalogPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, rental_plans(id)")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Catalog</h1>
        <Link href="/admin/catalog/new" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-slate-800">
          Add device
        </Link>
      </div>
      <p className="mt-2 text-slate-300">
        Edit prices, descriptions, images, and rental plans. Changes go live on the shop immediately.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-2">Device</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Cash price</th>
              <th className="px-4 py-2">Plans</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products?.map((product: any) => (
              <tr key={product.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                <td className="px-4 py-3 text-slate-400">{product.category}</td>
                <td className="px-4 py-3">{formatCurrency(product.cash_price)}</td>
                <td className="px-4 py-3 text-slate-400">{product.rental_plans?.length ?? 0}</td>
                <td className="px-4 py-3 text-slate-400">{product.status}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/catalog/${product.id}`} className="font-medium text-accent hover:text-accent-dark">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

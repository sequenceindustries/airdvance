import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/pricing";
import { updateProduct, addRentalPlan, updateRentalPlan, deleteRentalPlan } from "@/lib/actions/catalog";

export default async function AdminCatalogEditPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", params.id).maybeSingle();
  if (!product) notFound();

  const { data: plans } = await supabase
    .from("rental_plans")
    .select("*")
    .eq("product_id", product.id)
    .order("term_months", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-slate-400">Catalog</p>
      <h1 className="font-display text-3xl">{product.name}</h1>

      <section className="mt-8 rounded-lg border border-white/10 bg-surface p-6">
        <h2 className="font-medium text-ink">Device details</h2>
        <form action={async (fd: FormData) => { "use server"; await updateProduct(product.id, fd); }} className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Name
              <input name="name" defaultValue={product.name} className="input mt-1" required />
            </label>
            <label className="text-sm">
              Brand
              <input name="brand" defaultValue={product.brand} className="input mt-1" required />
            </label>
          </div>
          <label className="text-sm">
            Description
            <textarea name="description" defaultValue={product.description} className="input mt-1" rows={3} />
          </label>
          <label className="text-sm">
            Image URLs (comma-separated — the first one is used as the main photo)
            <textarea
              name="images"
              defaultValue={(product.images ?? []).join(", ")}
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              className="input mt-1"
              rows={2}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Cash price (R)
              <input name="cash_price" type="number" defaultValue={product.cash_price} className="input mt-1" required />
            </label>
            <label className="text-sm">
              Status
              <select name="status" defaultValue={product.status} className="input mt-1">
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
          </div>
          <button className="mt-2 self-start rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-slate-800">
            Save changes
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-surface p-6">
        <h2 className="font-medium text-ink">Rental plans</h2>
        <div className="mt-4 overflow-hidden rounded-md border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-3 py-2">Term</th>
                <th className="px-3 py-2">Monthly</th>
                <th className="px-3 py-2">Admin fee</th>
                <th className="px-3 py-2">Buyout</th>
                <th className="px-3 py-2">Total payable</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {plans?.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-3 py-2">
                    <input form={`plan-${plan.id}`} name="term_months" type="number" defaultValue={plan.term_months} className="input" />
                  </td>
                  <td className="px-3 py-2">
                    <input form={`plan-${plan.id}`} name="monthly_payment" type="number" defaultValue={plan.monthly_payment} className="input" />
                  </td>
                  <td className="px-3 py-2">
                    <input form={`plan-${plan.id}`} name="admin_fee" type="number" defaultValue={plan.admin_fee} className="input" />
                  </td>
                  <td className="px-3 py-2">
                    <input form={`plan-${plan.id}`} name="buyout_amount" type="number" defaultValue={plan.buyout_amount} className="input" />
                  </td>
                  <td className="px-3 py-2 text-slate-400">{formatCurrency(plan.total_payable)}</td>
                  <td className="px-3 py-2">
                    <select form={`plan-${plan.id}`} name="status" defaultValue={plan.status} className="input">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button form={`plan-${plan.id}`} className="rounded-md border border-white/20 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10">
                      Save
                    </button>
                    {/* This empty form carries the id + server action every input/select/button
                        above references via the form="plan-<id>" attribute. It has to live
                        outside the <tr> because a <form> is not a valid direct child of <tr>/<table> —
                        browsers silently relocate ("foster-parent") it out during HTML parsing,
                        which orphans any cells it would otherwise wrap. */}
                    <form id={`plan-${plan.id}`} action={async (fd: FormData) => { "use server"; await updateRentalPlan(plan.id, fd); }} />
                  </td>
                  <td className="px-1">
                    <form action={async () => { "use server"; await deleteRentalPlan(plan.id); }}>
                      <button className="rounded-md border border-alert/40 px-3 py-1 text-xs font-medium text-alert hover:bg-alert-light">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 text-sm font-medium text-ink">Add a new plan</h3>
        <form
          action={async (fd: FormData) => { "use server"; await addRentalPlan(product.id, fd); }}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <label className="text-sm">
            Term (months)
            <input name="term_months" type="number" defaultValue={12} className="input mt-1 w-28" required />
          </label>
          <label className="text-sm">
            Monthly payment (R)
            <input name="monthly_payment" type="number" className="input mt-1 w-32" required />
          </label>
          <label className="text-sm">
            Deposit (R)
            <input name="deposit" type="number" defaultValue={0} className="input mt-1 w-28" />
          </label>
          <label className="text-sm">
            Admin fee (R)
            <input name="admin_fee" type="number" defaultValue={150} className="input mt-1 w-28" />
          </label>
          <label className="text-sm">
            Buyout (R)
            <input name="buyout_amount" type="number" defaultValue={1} className="input mt-1 w-28" />
          </label>
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-slate-800">
            Add plan
          </button>
        </form>
      </section>
    </div>
  );
}

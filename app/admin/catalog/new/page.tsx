import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/customer";
import { createProduct } from "@/lib/actions/catalog";

export default async function NewProductPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createProduct(formData);
    if (result?.productId) redirect(`/admin/catalog/${result.productId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">Add a device</h1>
      <p className="mt-2 text-slate-300">You can add rental plans once the device is created.</p>

      <form action={handleCreate} className="mt-8 flex flex-col gap-4 rounded-lg border border-white/10 bg-surface p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Name
            <input name="name" required className="input mt-1" placeholder="Samsung Galaxy A55" />
          </label>
          <label className="text-sm">
            Brand
            <input name="brand" required className="input mt-1" placeholder="Samsung" />
          </label>
        </div>
        <label className="text-sm">
          Category
          <select name="category" className="input mt-1">
            <option value="SMARTPHONE">Smartphone</option>
            <option value="TABLET">Tablet</option>
            <option value="LAPTOP">Laptop</option>
          </select>
        </label>
        <label className="text-sm">
          Description
          <textarea name="description" className="input mt-1" rows={3} />
        </label>
        <label className="text-sm">
          Image URLs (comma-separated)
          <textarea name="images" className="input mt-1" rows={2} placeholder="https://example.com/photo.jpg" />
        </label>
        <label className="text-sm">
          Cash price (R)
          <input name="cash_price" type="number" required className="input mt-1" />
        </label>
        <button className="mt-2 self-start rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-slate-800">
          Create device
        </button>
      </form>
    </div>
  );
}

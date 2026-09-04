"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { totalPayable } from "@/lib/pricing";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "ADMIN") throw new Error("Admin only");
  return user.id;
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();

  const imagesRaw = String(formData.get("images") ?? "");
  const images = imagesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await service
    .from("products")
    .update({
      name: String(formData.get("name")),
      brand: String(formData.get("brand")),
      description: String(formData.get("description") ?? ""),
      cash_price: Number(formData.get("cash_price")),
      status: String(formData.get("status")),
      images,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  revalidatePath(`/admin/catalog/${productId}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function addRentalPlan(productId: string, formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();

  const term_months = Number(formData.get("term_months"));
  const monthly_payment = Number(formData.get("monthly_payment"));
  const deposit = Number(formData.get("deposit") ?? 0);
  const admin_fee = Number(formData.get("admin_fee") ?? 150);
  const buyout_amount = Number(formData.get("buyout_amount") ?? 10);

  const { error } = await service.from("rental_plans").insert({
    product_id: productId,
    term_months,
    monthly_payment,
    deposit,
    admin_fee,
    buyout_amount,
    total_payable: totalPayable({ term_months, monthly_payment, deposit, admin_fee }),
    status: "ACTIVE",
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/catalog/${productId}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function updateRentalPlan(planId: string, formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();

  const term_months = Number(formData.get("term_months"));
  const monthly_payment = Number(formData.get("monthly_payment"));
  const deposit = Number(formData.get("deposit") ?? 0);
  const admin_fee = Number(formData.get("admin_fee") ?? 150);
  const buyout_amount = Number(formData.get("buyout_amount") ?? 10);
  const status = String(formData.get("status"));

  const { error } = await service
    .from("rental_plans")
    .update({
      term_months,
      monthly_payment,
      deposit,
      admin_fee,
      buyout_amount,
      total_payable: totalPayable({ term_months, monthly_payment, deposit, admin_fee }),
      status,
    })
    .eq("id", planId);

  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  revalidatePath("/shop");
  return { success: true };
}

export async function deleteRentalPlan(planId: string) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service.from("rental_plans").delete().eq("id", planId);
  if (error) return { error: error.message };
  revalidatePath("/admin/catalog");
  return { success: true };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();

  const name = String(formData.get("name"));
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const imagesRaw = String(formData.get("images") ?? "");
  const images = imagesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { data, error } = await service
    .from("products")
    .insert({
      name,
      slug,
      brand: String(formData.get("brand")),
      category: String(formData.get("category")),
      description: String(formData.get("description") ?? ""),
      specifications: {},
      cash_price: Number(formData.get("cash_price")),
      images,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  revalidatePath("/shop");
  return { success: true, productId: data.id };
}

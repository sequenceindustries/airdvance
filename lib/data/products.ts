import { createClient } from "@/lib/supabase/server";
import type { DeviceCategory, Product, RentalPlan } from "@/types/domain";

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Product[];
}

export async function getProductsByCategory(category: DeviceCategory): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "ACTIVE")
    .eq("category", category)
    .order("cash_price", { ascending: true });
  if (error) throw error;
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getRentalPlans(productId: string): Promise<RentalPlan[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rental_plans")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "ACTIVE")
    .order("term_months", { ascending: true });
  if (error) throw error;
  return data as RentalPlan[];
}

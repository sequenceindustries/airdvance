"use server";

import { createClient } from "@/lib/supabase/server";
import type { Product, RentalPlan } from "@/types/domain";

/**
 * Lets the apply wizard switch to a different device or plan in place,
 * without navigating away and losing everything the customer has already
 * filled in. Only ever returns ACTIVE products/plans -- the same data any
 * visitor could see on the shop.
 */
export async function fetchProductWithPlans(
  productId: string,
): Promise<{ product: Product; plans: RentalPlan[] } | null> {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("status", "ACTIVE")
    .maybeSingle<Product>();
  if (!product) return null;

  const { data: plans } = await supabase
    .from("rental_plans")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "ACTIVE")
    .order("term_months", { ascending: true });

  return { product, plans: (plans ?? []) as RentalPlan[] };
}

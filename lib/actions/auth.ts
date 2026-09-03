"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const full_name = String(formData.get("full_name"));
  const mobile = String(formData.get("mobile") ?? "");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`);

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name,
      email,
      mobile,
      role: "CUSTOMER",
    });
  }

  redirect("/apply");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();

  revalidatePath("/", "layout");
  redirect(profile?.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

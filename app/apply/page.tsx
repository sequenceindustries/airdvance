import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug, getRentalPlans } from "@/lib/data/products";
import { ApplyWizard } from "./apply-wizard";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: { product?: string; plan?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const query = searchParams.product
      ? `?next=/apply?product=${searchParams.product}%26plan=${searchParams.plan ?? ""}`
      : "";
    redirect(`/login${query}`);
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!searchParams.product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl">Start your application</h1>
        <p className="mt-3 text-slate-300">
          Pick a device and a rental plan first, then come back here to apply.
        </p>
        <a href="/shop" className="mt-6 inline-block rounded-md bg-ink px-6 py-3 font-medium text-paper">
          Shop devices
        </a>
      </div>
    );
  }

  const product = await getProductBySlug(searchParams.product);
  if (!product) {
    return <div className="mx-auto max-w-xl px-6 py-20">We couldn't find that device.</div>;
  }
  const plans = await getRentalPlans(product.id);
  const plan = plans.find((p) => p.id === searchParams.plan) ?? plans[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <ApplyWizard product={product} plan={plan} profile={profile} />
    </div>
  );
}

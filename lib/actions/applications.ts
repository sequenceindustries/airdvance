"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface ApplicationDraft {
  product_id: string;
  rental_plan_id: string;
  personal_info: {
    full_name: string;
    id_number: string;
    date_of_birth: string;
    mobile: string;
    email: string;
  };
  address: { residential: string; postal?: string };
  employment: { status: string; employer?: string; monthly_income: number; notes?: string };
  consent_accepted: boolean;
}

export async function submitApplication(draft: ApplicationDraft) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to apply." };

  if (!draft.consent_accepted) {
    return { error: "You must accept the declaration to continue." };
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      customer_id: user.id,
      product_id: draft.product_id,
      rental_plan_id: draft.rental_plan_id,
      personal_info: draft.personal_info,
      address: draft.address,
      employment: draft.employment,
      consent_accepted: draft.consent_accepted,
      status: "SUBMITTED",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const service = createServiceClient();
  await service.from("audit_logs").insert({
    actor: user.id,
    action: "APPLICATION_SUBMITTED",
    entity: "application",
    entity_id: application.id,
    metadata: { product_id: draft.product_id, rental_plan_id: draft.rental_plan_id },
  });
  await service.from("notifications").insert({
    customer_id: user.id,
    type: "APPLICATION_RECEIVED",
    title: "Application received",
    body: "We've received your application and are reviewing it now.",
  });

  redirect(`/apply/status/${application.id}`);
}

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
  debit_order: {
    bank_name: string;
    account_holder: string;
    account_number: string;
    branch_code: string;
    account_type: string;
  };
  next_payday: string; // ISO date -- when the customer says they're next paid
  consent_accepted: boolean;
}

/**
 * This is rent-to-buy, not credit -- there is no credit check. The only
 * gate is affordability and employment, which is why this step collects
 * income/employment rather than running any kind of credit assessment.
 *
 * The customer applies and authorizes a debit order mandate, but we do NOT
 * charge immediately. The first collection is scheduled for their next payday.
 * The agreement, payment schedule and device allocation are only created once
 * that first collection actually succeeds (see lib/actions/collections.ts),
 * so the device only ships after a real payment has cleared.
 */
export async function submitApplication(draft: ApplicationDraft) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to apply." };

  if (!draft.consent_accepted) {
    return { error: "You must accept the declaration and debit order authorization to continue." };
  }

  const accountNumber = draft.debit_order.account_number.replace(/\s+/g, "");
  if (accountNumber.length < 4) {
    return { error: "Please enter a valid bank account number." };
  }

  if (!draft.next_payday) {
    return { error: "Please tell us when your next payday is." };
  }

  const service = createServiceClient();

  const { data: device } = await service
    .from("inventory")
    .select("id")
    .eq("product_id", draft.product_id)
    .eq("status", "AVAILABLE")
    .limit(1)
    .maybeSingle();
  if (!device) return { error: "This device is currently out of stock. Please check back soon." };

  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      customer_id: user.id,
      product_id: draft.product_id,
      rental_plan_id: draft.rental_plan_id,
      personal_info: draft.personal_info,
      address: draft.address,
      employment: draft.employment,
      consent_accepted: draft.consent_accepted,
      status: "UNDER_REVIEW",
      submitted_at: new Date().toISOString(),
      next_collection_date: draft.next_payday,
    })
    .select()
    .single();
  if (appError) return { error: appError.message };

  await service.from("audit_logs").insert({
    actor: user.id,
    action: "APPLICATION_SUBMITTED",
    entity: "application",
    entity_id: application.id,
    metadata: { product_id: draft.product_id, rental_plan_id: draft.rental_plan_id, next_payday: draft.next_payday },
  });

  // Only the last 4 digits of the account number are stored -- there is no
  // legitimate reason to retain the full number.
  const { data: mandate, error: mandateError } = await service
    .from("debit_order_mandates")
    .insert({
      customer_id: user.id,
      application_id: application.id,
      bank_name: draft.debit_order.bank_name,
      account_holder: draft.debit_order.account_holder,
      account_number_last4: accountNumber.slice(-4),
      branch_code: draft.debit_order.branch_code,
      account_type: draft.debit_order.account_type,
    })
    .select()
    .single();
  if (mandateError) return { error: mandateError.message };

  await service.from("applications").update({ debit_order_mandate_id: mandate.id }).eq("id", application.id);

  await service.from("notifications").insert({
    customer_id: user.id,
    type: "APPLICATION_RECEIVED",
    title: "Debit order authorized",
    body: `We'll collect your first payment on ${draft.next_payday}. As soon as it clears, we'll ship your device within 7 days.`,
  });

  redirect(`/apply/status/${application.id}`);
}

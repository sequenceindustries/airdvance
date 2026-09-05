import { createClient } from "@/lib/supabase/server";
import type {
  Agreement,
  DeviceControlRecord,
  InventoryDevice,
  NotificationRecord,
  Product,
  ScheduledPayment,
} from "@/types/domain";

export interface AgreementWithContext extends Agreement {
  product: Product;
  device: InventoryDevice;
  device_control: DeviceControlRecord | null;
}

export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return profile;
}

export async function getCustomerAgreements(customerId: string): Promise<AgreementWithContext[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agreements")
    .select("*, product:products(*), device:inventory!agreements_device_id_fkey(*), device_control:device_control(*)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...row,
    device_control: Array.isArray(row.device_control) ? row.device_control[0] ?? null : row.device_control,
  }));
}

export async function getAgreementSchedule(agreementId: string): Promise<ScheduledPayment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payment_schedule")
    .select("*")
    .eq("agreement_id", agreementId)
    .order("payment_number", { ascending: true });
  if (error) throw error;
  return data as ScheduledPayment[];
}

export async function getCustomerNotifications(customerId: string): Promise<NotificationRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as NotificationRecord[];
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses Row Level Security — never import this
 * outside server-only code (route handlers, server actions, DeviceControlService).
 * It must never be exposed to the browser, and the key it uses must never be
 * prefixed with NEXT_PUBLIC_.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

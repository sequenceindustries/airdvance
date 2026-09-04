"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface ContactDraft {
  name: string;
  email: string;
  message: string;
}

export async function submitContactMessage(draft: ContactDraft) {
  if (!draft.name.trim() || !draft.email.trim() || !draft.message.trim()) {
    return { error: "Please fill in your name, email and message." };
  }

  const service = createServiceClient();
  const { error } = await service.from("contact_messages").insert({
    name: draft.name.trim(),
    email: draft.email.trim(),
    message: draft.message.trim(),
  });

  if (error) return { error: "Something went wrong sending your message. Please try again." };

  return { success: true };
}

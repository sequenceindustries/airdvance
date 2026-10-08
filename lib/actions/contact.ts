"use server";

import { z } from "zod";
import { query } from "@/lib/db";
import type { FormState } from "./auth";

const Schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address."),
  mobile: z.string().trim().max(30).optional(),
  topic: z.string().max(40).optional().default("General"),
  message: z.string().trim().min(5, "Please add a message.").max(4000),
  website: z.string().max(0).optional(), // honeypot
});

export async function sendContactMessage(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = Schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await query("insert into contact_messages (name, email, mobile, topic, message) values ($1,$2,$3,$4,$5)", [
    d.name,
    d.email,
    d.mobile || null,
    d.topic,
    d.message,
  ]);
  return { message: "Thanks — we've received your message and will reply within one business day." };
}

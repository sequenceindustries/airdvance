import "server-only";

/**
 * Outbound SMS / WhatsApp. Set MESSAGING_PROVIDER=twilio with TWILIO_ACCOUNT_SID,
 * TWILIO_AUTH_TOKEN and TWILIO_FROM (an SMS number, or "whatsapp:+27..." for
 * WhatsApp) to send real messages. Without it the mock provider is used and
 * one-time PINs are shown on screen, clearly labelled as demo mode.
 */
export interface MessagingProvider {
  readonly name: string;
  send(toE164: string, body: string): Promise<{ ok: boolean; error?: string }>;
}

class MockMessaging implements MessagingProvider {
  readonly name = "mock";
  async send(to: string, body: string) {
    console.log(`[messaging:mock] to ${to}: ${body}`);
    return { ok: true };
  }
}

class TwilioMessaging implements MessagingProvider {
  readonly name = "twilio";
  constructor(private sid: string, private token: string, private from: string) {}
  async send(to: string, body: string) {
    const toAddr = this.from.startsWith("whatsapp:") ? `whatsapp:${to}` : to;
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.sid}:${this.token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toAddr, From: this.from, Body: body }),
    });
    if (!res.ok) return { ok: false, error: `Twilio ${res.status}` };
    return { ok: true };
  }
}

export function messaging(): MessagingProvider {
  if (process.env.MESSAGING_PROVIDER === "twilio") {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM } = process.env;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM) {
      return new TwilioMessaging(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM);
    }
  }
  return new MockMessaging();
}

export function isDemoMessaging() {
  return messaging().name === "mock";
}

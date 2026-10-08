import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/ui";
import { COMPANY } from "@/lib/config";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/contact");

export default function ContactPage() {
  const wa = COMPANY.whatsapp.replace(/\D/g, "");
  return (
    <>
      <PageHero title="Contact us" intro="We aim to reply within one business day." />
      <section className="container-x grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="glass p-6 sm:p-8">
          <ContactForm />
        </div>
        <div className="space-y-4">
          {wa && (
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi Airdvance, I have a question.")}`} target="_blank" rel="noreferrer" className="glass flex items-center gap-4 p-5 transition hover:border-mint/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/15 text-mint">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.4-.7-2.9-1.1-4.7-4.1-4.9-4.3-.1-.2-1.2-1.5-1.2-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" /></svg>
              </span>
              <span>
                <span className="block font-semibold">Chat on WhatsApp</span>
                <span className="block text-sm text-ink-muted">Weekdays 08:00–17:00</span>
              </span>
            </a>
          )}
          <div className="glass p-5 text-sm leading-relaxed text-ink-muted">
            <p className="font-semibold text-ink">Email</p>
            <p className="mt-1">{COMPANY.email}</p>
            {COMPANY.phone && (
              <>
                <p className="mt-4 font-semibold text-ink">Phone</p>
                <p className="mt-1">{COMPANY.phone}</p>
              </>
            )}
            <p className="mt-4 font-semibold text-ink">Complaints</p>
            <p className="mt-1">
              {COMPANY.complaintsEmail} — see our <Link href="/complaints" className="text-ember-300 underline">complaints process</Link>.
            </p>
          </div>
          <div className="glass p-5 text-sm leading-relaxed text-ink-muted">
            <p className="font-semibold text-ink">Stay safe</p>
            <p className="mt-1">We'll never ask for your banking password, bank OTP or an upfront fee.</p>
          </div>
        </div>
      </section>
    </>
  );
}

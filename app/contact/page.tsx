import { ContactForm } from "@/components/contact-form";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl">Contact us</h1>
      <p className="mt-3 max-w-2xl text-slate-300">
        Get instant answers from our assistant, chat with us on WhatsApp, or send a message and a
        real person will get back to you.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <WhatsAppButton />
          <div>
            <h2 className="mb-3 font-display text-xl">Send us a message</h2>
            <ContactForm />
          </div>
        </div>

        <ChatWidget />
      </div>
    </div>
  );
}

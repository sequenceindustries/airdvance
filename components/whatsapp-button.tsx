const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "27000000000";

export function WhatsAppButton() {
  const message = encodeURIComponent("Hi airdvance, I have a question about my device.");

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-surface p-5 transition hover:border-signal/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal-light text-signal">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.85.508 3.585 1.395 5.07L2 22l5.08-1.375A9.945 9.945 0 0012.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2zm0 18.031a8.02 8.02 0 01-4.264-1.226l-.306-.184-3.017.816.816-3.017-.184-.306a8.031 8.031 0 1114.955-4.114 8.037 8.037 0 01-8 8.031z" />
        </svg>
      </span>
      <span>
        <span className="block font-medium text-ink">Chat on WhatsApp</span>
        <span className="block text-sm text-slate-400">Usually replies within a few minutes</span>
      </span>
    </a>
  );
}

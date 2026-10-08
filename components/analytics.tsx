import Script from "next/script";

/** Google Analytics 4. Override with NEXT_PUBLIC_GA_ID, or set it to "off" to disable. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-FQ3T7FMQE2";

export function Analytics() {
  if (!GA_ID || GA_ID === "off") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}

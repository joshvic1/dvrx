import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=JhuQzWQMYnYKirrN3NvrSS";
  const whatsappFallback = "https://chat.whatsapp.com/JhuQzWQMYnYKirrN3NvrSS";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // get or create external_id
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ FIRE PIXEL (client-side)
    if (window.ttq) {
      window.ttq.identify({ external_id: externalId });
      window.ttq.track("ViewContent", {
        content_id: "whatsapp_redirect_page",
        content_type: "product",
        content_name: "Join WhatsApp Group Redirect",
        value: 0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      });
    }

    // ✅ FIRE SERVER EVENT (backend)
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: externalId,
        content_id: "whatsapp_redirect_page",
        content_type: "product",
        content_name: "Join WhatsApp Group Redirect",
        value: 0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    }).catch(() => {});

    // ✅ redirect AFTER a short delay
    const redirectTimer = setTimeout(() => {
      if (!isTikTokBrowser) {
        window.location.href = whatsappDeepLink;
        setTimeout(() => (window.location.href = whatsappFallback), 800);
      } else {
        window.location.href = whatsappFallback;
      }
    }, 1200); // wait 1.2s before redirect

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center">
      <h1 className="text-2xl font-semibold">Redirecting you to WhatsApp...</h1>
      <p className="text-gray-400 mt-2">Please wait a moment</p>
    </div>
  );
}

RedirectToWhatsApp.hideLayout = true;

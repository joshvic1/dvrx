import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=JhuQzWQMYnYKirrN3NvrSS";
  const whatsappFallback = "https://chat.whatsapp.com/JhuQzWQMYnYKirrN3NvrSS";

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // get or create external_id
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // send event (fire and forget)
    fetch("/api/tiktok-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "AutoRedirect",
        external_id: externalId,
      }),
    }).catch(() => {});

    // instant redirect logic
    if (!isTikTokBrowser) {
      // trigger WhatsApp popup immediately
      window.location.replace(whatsappDeepLink);
      // fallback after short timeout if WhatsApp not installed
      setTimeout(() => {
        window.location.replace(whatsappFallback);
      }, 700);
    } else {
      // inside TikTok → open fallback directly
      window.location.replace(whatsappFallback);
    }
  }, []);

  // return nothing visible
  return null;
}

RedirectToWhatsApp.hideLayout = true;

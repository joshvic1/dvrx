import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=JhuQzWQMYnYKirrN3NvrSS";
  const whatsappFallback = "https://chat.whatsapp.com/JhuQzWQMYnYKirrN3NvrSS";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // ✅ Get or create external_id
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ Fire ViewContent pixel
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.identify({ external_id: externalId });
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: "whatsapp_redirect_page",
            content_type: "product",
            content_name: "Join WhatsApp Group Redirect",
          },
        ],
        value: 500.0,
        currency: "NGN",
      });
    }

    // ✅ Send ViewContent server event
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: externalId,
        content_id: "whatsapp_redirect_page",
        content_type: "product",
        content_name: "Join WhatsApp Group Redirect",
        value: 500.0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    }).catch(() => {});

    // ✅ Fire "CompleteRegistration" event before redirect
    const eventTimer = setTimeout(() => {
      if (window.ttq) {
        window.ttq.track("CompleteRegistration", {
          contents: [
            {
              content_id: "whatsapp_join_success",
              content_type: "product",
              content_name: "Joined WhatsApp Group",
            },
          ],
          value: 500.0,
          currency: "NGN",
        });
      }

      // ✅ Send server event for CompleteRegistration
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "CompleteRegistration",
          external_id: externalId,
          content_id: "whatsapp_join_success",
          content_type: "product",
          content_name: "Joined WhatsApp Group",
          value: 500.0,
          currency: "NGN",
          event_time: Math.floor(Date.now() / 1000),
          url: window.location.href,
        }),
      }).catch(() => {});

      // ✅ Redirect after event fires
      setTimeout(() => {
        if (!isTikTokBrowser) {
          window.location.href = whatsappDeepLink;
          setTimeout(() => (window.location.href = whatsappFallback), 1000);
        } else {
          window.location.href = whatsappFallback;
        }
      }, 800); // redirect 0.8s later
    }, 1200); // wait 1.2s after load

    return () => clearTimeout(eventTimer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center">
      <h1 className="text-2xl font-semibold">Redirecting you to WhatsApp...</h1>
      <p className="text-gray-400 mt-2">Please wait a moment</p>
    </div>
  );
}

RedirectToWhatsApp.hideLayout = true;

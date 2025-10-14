import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=JhuQzWQMYnYKirrN3NvrSS";
  const whatsappFallback = "https://chat.whatsapp.com/JhuQzWQMYnYKirrN3NvrSS";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ Step 1: Fire ViewContent
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
        value: 50.0,
        currency: "NGN",
      });
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: externalId,
        content_id: "whatsapp_redirect_page",
        content_type: "product",
        content_name: "Join WhatsApp Group Redirect",
        value: 50.0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    }).catch(() => {});

    // ✅ Step 2: Function to fire CompleteRegistration
    const fireCompleteRegistration = () => {
      if (window.ttq) {
        window.ttq.track("CompleteRegistration", {
          contents: [
            {
              content_id: "whatsapp_join_success",
              content_type: "product",
              content_name: "Joined WhatsApp Group",
            },
          ],
          value: 50.0,
          currency: "NGN",
        });
      }

      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "CompleteRegistration",
          external_id: externalId,
          content_id: "whatsapp_join_success",
          content_type: "product",
          content_name: "Joined WhatsApp Group",
          value: 50.0,
          currency: "NGN",
          event_time: Math.floor(Date.now() / 1000),
          url: window.location.href,
        }),
      }).catch(() => {});
    };

    let fired = false;
    let whatsappOpened = false;

    // ✅ Step 3: Try to open WhatsApp deep link
    const startTime = Date.now();
    window.location.href = whatsappDeepLink;

    // ⏱ Step 4: Detect if WhatsApp likely opened
    // If user leaves tab (goes to WhatsApp), visibilitychange fires
    const handleVisibilityChange = () => {
      if (!fired && document.visibilityState === "hidden") {
        whatsappOpened = true;
        fireCompleteRegistration();
        fired = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 🧩 Step 5: After 1.5s, check if still visible (means WhatsApp failed)
    const fallbackTimer = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      if (!whatsappOpened && elapsed >= 1400) {
        // Deep link failed — go to fallback, but DO NOT fire CompleteRegistration
        window.location.href = whatsappFallback;
      }
    }, 1400);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center">
      <h1 className="text-2xl font-semibold">Redirecting you to WhatsApp...</h1>
      <p className="text-gray-400 mt-2">Please wait a moment</p>
    </div>
  );
}

RedirectToWhatsApp.hideLayout = true;

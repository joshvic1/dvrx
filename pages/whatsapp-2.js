import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=IvWCSpVStGaEPCLuRcQYNs";
  const whatsappFallback = "https://chat.whatsapp.com/IvWCSpVStGaEPCLuRcQYNs";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // ✅ Generate or reuse user ID
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ 1. Fire ViewContent (user landed on redirect page)
    if (window.ttq) {
      window.ttq.identify({ external_id: externalId });
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: "whatsapp_redirect_page_group2",
            content_type: "product",
            content_name: "Join WhatsApp Group 2 Redirect",
          },
        ],
        value: 50.0,
        currency: "NGN",
      });
    }

    // 🔄 Send to backend
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: externalId,
        content_id: "whatsapp_redirect_page_group2",
        content_type: "product",
        content_name: "Join WhatsApp Group 2 Redirect",
        value: 50.0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    }).catch(() => {});

    // ✅ 2. Function to fire CompleteRegistration ONLY if WhatsApp actually opened
    const fireCompleteRegistration = () => {
      if (window.ttq) {
        window.ttq.track("CompleteRegistration", {
          contents: [
            {
              content_id: "whatsapp_join_success_group2",
              content_type: "product",
              content_name: "Joined WhatsApp Group 2",
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
          content_id: "whatsapp_join_success_group2",
          content_type: "product",
          content_name: "Joined WhatsApp Group 2",
          value: 50.0,
          currency: "NGN",
          event_time: Math.floor(Date.now() / 1000),
          url: window.location.href,
        }),
      }).catch(() => {});
    };

    // ✅ 3. Track redirect behavior
    let registrationFired = false;
    let whatsappOpened = false;
    const startTime = Date.now();

    // Try opening WhatsApp app
    window.location.href = whatsappDeepLink;

    // Detect if WhatsApp actually opened
    const handleVisibilityChange = () => {
      if (!registrationFired && document.visibilityState === "hidden") {
        whatsappOpened = true;
        fireCompleteRegistration();
        registrationFired = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Fallback if WhatsApp app doesn’t open
    const fallbackTimer = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      if (!whatsappOpened && elapsed >= 1400) {
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

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsAppDM() {
  const whatsappDeepLink =
    "https://wa.me/2348098945437?text=Hey%20Josh%2C%20I%20want%20to%20buy%20your%20training%20course%20for%205k..Please%20send%20your%20account%20number";
  const whatsappFallback =
    "https://wa.me/2348098945437?text=Hey%20Josh%2C%20I%20want%20to%20buy%20your%20training%20course%20for%205k..Please%20send%20your%20account%20number";

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // ✅ Generate or get a persistent unique user ID
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ Step 1: Fire ViewContent (page viewed)
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.identify({ external_id: externalId });
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: "whatsapp_dm_redirect_page",
            content_type: "product",
            content_name: "Open WhatsApp DM Redirect",
          },
        ],
        value: 50.0,
        currency: "NGN",
      });
    }

    // Send to backend for tracking
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: externalId,
        content_id: "whatsapp_dm_redirect_page",
        content_type: "product",
        content_name: "Open WhatsApp DM Redirect",
        value: 50.0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    }).catch(() => {});

    // ✅ Step 2: Define CompleteRegistration trigger
    const fireCompleteRegistration = () => {
      if (window.ttq) {
        window.ttq.track("CompleteRegistration", {
          contents: [
            {
              content_id: "whatsapp_dm_success",
              content_type: "product",
              content_name: "Opened WhatsApp DM",
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
          content_id: "whatsapp_dm_success",
          content_type: "product",
          content_name: "Opened WhatsApp DM",
          value: 50.0,
          currency: "NGN",
          event_time: Math.floor(Date.now() / 1000),
          url: window.location.href,
        }),
      }).catch(() => {});
    };

    let fired = false;
    let whatsappOpened = false;

    // ✅ Step 3: Attempt WhatsApp deep link
    const startTime = Date.now();
    window.location.href = whatsappDeepLink;

    // ✅ Step 4: Detect tab switch (user opened WhatsApp)
    const handleVisibilityChange = () => {
      if (!fired && document.visibilityState === "hidden") {
        whatsappOpened = true;
        fireCompleteRegistration();
        fired = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ✅ Step 5: Fallback if WhatsApp doesn’t open
    const fallbackTimer = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      if (!whatsappOpened && elapsed >= 1400) {
        window.location.href = whatsappFallback;
      }
    }, 1400);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center">
      <h1 className="text-2xl font-semibold">Opening WhatsApp chat...</h1>
      <p className="text-gray-400 mt-2">Please wait a moment</p>
    </div>
  );
}

RedirectToWhatsAppDM.hideLayout = true;

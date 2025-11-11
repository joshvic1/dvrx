"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=Jqyr7iuNfSKCAFUWGgkX2z";
  const whatsappFallback = "https://chat.whatsapp.com/Jqyr7iuNfSKCAFUWGgkX2z";

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // Generate or reuse a unique ID for TikTok tracking consistency
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ Fire "Contact" event instead of "CompleteRegistration"
    const fireContactEvent = () => {
      if (typeof window !== "undefined" && window.ttq) {
        setTimeout(() => {
          window.ttq.identify({ external_id: externalId });
          window.ttq.track("Contact", {
            contents: [
              {
                content_id: "whatsapp_join_success_group2",
                content_type: "product",
                content_name: "Joined WhatsApp Group 2",
              },
            ],
            value: 5,
            currency: "NGN",
            description: "User successfully opened WhatsApp from redirect",
            event_time: Math.floor(Date.now() / 1000),
            url: window.location.href,
          });
        }, 300);
      }
    };

    let eventFired = false;
    let whatsappOpened = false;
    const startTime = Date.now();

    // Try to open WhatsApp
    window.location.href = whatsappDeepLink;

    // Detect if WhatsApp actually opened (user leaves the page)
    const handleVisibilityChange = () => {
      if (!eventFired && document.visibilityState === "hidden") {
        whatsappOpened = true;
        fireContactEvent(); // 👈 fire Contact event here
        eventFired = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // If WhatsApp didn’t open, redirect to fallback link
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
      <h1 className="text-2xl font-semibold">Redirecting you to WhatsApp...</h1>
      <p className="text-gray-400 mt-2">Please wait a moment</p>
    </div>
  );
}

RedirectToWhatsApp.hideLayout = true;

"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=IvWCSpVStGaEPCLuRcQYNs";
  const whatsappFallback = "https://chat.whatsapp.com/IvWCSpVStGaEPCLuRcQYNs";

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // Generate or reuse user ID
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ Fire CompleteRegistration when WhatsApp actually opens
    const fireCompleteRegistration = () => {
      if (typeof window !== "undefined" && window.ttq) {
        // small safety delay to ensure pixel is fully loaded
        setTimeout(() => {
          window.ttq.identify({ external_id: externalId });
          window.ttq.track("CompleteRegistration", {
            contents: [
              {
                content_id: "whatsapp_join_success_group2",
                content_type: "product",
                content_name: "Joined WhatsApp Group 2",
              },
            ],
            value: 0,
            currency: "NGN",
            description: "User successfully opened WhatsApp from redirect",
            event_time: Math.floor(Date.now() / 1000),
            url: window.location.href,
          });
        }, 300);
      }
    };

    let registrationFired = false;
    let whatsappOpened = false;
    const startTime = Date.now();

    // Try opening WhatsApp
    window.location.href = whatsappDeepLink;

    // Detect if user left page (meaning WhatsApp opened)
    const handleVisibilityChange = () => {
      if (!registrationFired && document.visibilityState === "hidden") {
        whatsappOpened = true;
        fireCompleteRegistration();
        registrationFired = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Fallback to WhatsApp web if app doesn’t open
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

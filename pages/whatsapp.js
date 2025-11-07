"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=IG6yJtHhY1GAMTUGypw4p2";
  const whatsappFallback = "https://chat.whatsapp.com/IG6yJtHhY1GAMTUGypw4p2";

  useEffect(() => {
    // Detect TikTok in-app browser
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // Generate or reuse external ID (kept locally if needed later)
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // Try to open WhatsApp via deep link
    let whatsappOpened = false;
    const startTime = Date.now();
    window.location.href = whatsappDeepLink;

    // Detect if WhatsApp actually opened (tab loses focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        whatsappOpened = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // If WhatsApp doesn’t open, redirect to fallback link after 1.4s
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

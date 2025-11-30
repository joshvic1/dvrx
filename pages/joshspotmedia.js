"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function JoinWhatsAppClassPage() {
  const [loading, setLoading] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const whatsappDeepLink = "whatsapp://chat?code=KReQ1CIdcQM7JSb6oqxWso";
  const whatsappFallback = "https://chat.whatsapp.com/KReQ1CIdcQM7JSb6oqxWso";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    // Run immediately on mount
    const tryEscapeTikTok = () => {
      if (typeof navigator === "undefined" || typeof window === "undefined")
        return;

      const ua = navigator.userAgent || "";
      const lower = ua.toLowerCase();

      const isTikTok =
        lower.includes("tiktok") ||
        lower.includes("bytedance") ||
        lower.includes("aweme") ||
        lower.includes("musically");

      if (!isTikTok) {
        // not in tiktok browser — no automatic escape needed
        return;
      }

      const isAndroid = /android/i.test(ua);
      const isIOS = /iphone|ipad|ipod/i.test(ua);

      setRedirectAttempted(true);

      if (isAndroid) {
        // Try intent scheme to open Chrome (works in many Android webviews)
        try {
          const chromeIntent = `intent://${whatsappFallback.replace(
            "https://",
            ""
          )}#Intent;package=com.android.chrome;scheme=https;end`;

          // attempt navigation
          window.location.href = chromeIntent;

          // fallback to the HTTPS link after a short delay (if intent blocked)
          setTimeout(() => {
            window.location.href = whatsappFallback;
          }, 600);
        } catch (e) {
          // fallback
          window.location.href = whatsappFallback;
        }

        // If nothing happens after 2s, show blocked UI
        setTimeout(() => setBlocked(true), 2000);
      } else if (isIOS) {
        // iOS: opening Safari directly is not possible from a webview reliably.
        // Best attempt: open in a new tab/window which many in-app browsers will hand off to Safari.
        try {
          const newWin = window.open(whatsappFallback, "_blank");
          if (!newWin) {
            // popup blocked or prevented — fallback attempt via location
            window.location.href = whatsappFallback;
          }
        } catch (e) {
          window.location.href = whatsappFallback;
        }

        // If still inside the webview after 2s, show blocked UI
        setTimeout(() => setBlocked(true), 2000);
      } else {
        // Unknown platform — fallback to opening the https link (best effort)
        window.location.href = whatsappFallback;
        setTimeout(() => setBlocked(true), 2000);
      }
    };

    tryEscapeTikTok();
    // run only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // click handler kept for manual fallback and tracking
  const handleClick = async () => {
    setLoading(true);

    // ensure external id for analytics
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // send event to your backend (fire-and-forget)
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ClickButton",
        external_id: externalId,
        content_id: "whatsapp_join_cta",
        content_type: "product",
        content_name: "Join WhatsApp Class CTA",
        value: 10,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: typeof window !== "undefined" ? window.location.href : "",
      }),
    }).catch(() => {});

    // Try same escape logic as above (manual)
    const ua = navigator.userAgent || "";
    const lower = ua.toLowerCase();
    const isTikTok =
      lower.includes("tiktok") ||
      lower.includes("bytedance") ||
      lower.includes("aweme") ||
      lower.includes("musically");

    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isTikTok && isAndroid) {
      const chromeIntent = `intent://${whatsappFallback.replace(
        "https://",
        ""
      )}#Intent;package=com.android.chrome;scheme=https;end`;
      window.location.href = chromeIntent;
      setTimeout(() => (window.location.href = whatsappFallback), 600);
    } else if (isTikTok && isIOS) {
      // open in new tab to encourage handoff to Safari
      const newWin = window.open(whatsappFallback, "_blank");
      if (!newWin) window.location.href = whatsappFallback;
    } else {
      // normal browsers
      window.location.href = whatsappDeepLink;
      setTimeout(() => (window.location.href = whatsappFallback), 800);
    }
  };

  // If redirect was attempted and blocked, show a short UI that instructs user
  if (redirectAttempted && blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#ECE5DD]">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Open in your browser</h3>
          <p className="text-sm text-gray-600 mb-4">
            It looks like TikTok's in-app browser prevented opening an external
            app. For the best experience, please open this page in Chrome
            (Android) or Safari (iOS) and tap the Join button again.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => {
                // Try open in new tab (user can then choose browser)
                window.open(whatsappFallback, "_blank");
              }}
              className="flex-1 bg-green-600 text-white py-2 rounded-md"
            >
              Open WhatsApp Group
            </button>

            <button
              onClick={() => {
                // Copy link for manual paste
                try {
                  navigator.clipboard.writeText(whatsappFallback);
                  alert(
                    "Link copied to clipboard. Paste it in your browser or WhatsApp."
                  );
                } catch {
                  alert("Copy failed. Please long-press the link to copy it.");
                }
              }}
              className="flex-1 border border-gray-200 py-2 rounded-md"
            >
              Copy Link
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Need help? Tap the three dots in TikTok and choose "Open in Browser"
            or "Open in Safari/Chrome".
          </p>
        </div>
      </div>
    );
  }

  // Normal page content (will usually not be seen if redirect works)
  return (
    <div className="min-h-screen bg-[#ECE5DD] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-10 -left-10 w-72 h-72 rounded-full bg-green-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 w-80 h-80 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-5 border border-green-200 relative">
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-semibold">
            <FaWhatsapp />
          </div>
          <div>
            <h2 className="font-bold text-lg text-green-700">
              WhatsApp Class Access
            </h2>
            <p className="text-xs text-gray-500">Online • Active now</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-[15px]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-100 text-green-900 p-3 rounded-lg max-w-[85%]"
          >
            Hi 👋 Welcome! Ready to join the free TikTok Ads training?
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-200 text-gray-900 p-3 rounded-lg ml-auto max-w-[85%]"
          >
            Yes, I’m ready to join the WhatsApp group ✅
          </motion.div>

          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-1 bg-green-100 px-3 py-2 rounded-full w-max"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300"></span>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            "Connecting to WhatsApp..."
          ) : (
            <>
              <FaWhatsapp size={22} />
              Join the WhatsApp Class
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

JoinWhatsAppClassPage.hideLayout = true;

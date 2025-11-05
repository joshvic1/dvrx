"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function JoinWhatsAppClassPage() {
  const [loading, setLoading] = useState(false);

  const whatsappDeepLink = "whatsapp://chat?code=JfsMT0ORUEm4e2AzQOrCH3";
  const whatsappFallback = "https://chat.whatsapp.com/JfsMT0ORUEm4e2AzQOrCH3";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  const handleClick = async () => {
    setLoading(true);

    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // Ensure user has external_id
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ FIRE ONLY CLICK BUTTON (PIXEL)
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.identify({ external_id: externalId });

      window.ttq.track("ClickButton", {
        contents: [
          {
            content_id: "whatsapp_join_cta",
            content_type: "product",
            content_name: "Join WhatsApp Class CTA",
          },
        ],
        value: 0,
        currency: "NGN",
        description: "User clicked Join WhatsApp Class button",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      });
    }

    // ✅ SEND CLICK BUTTON TO BACKEND ONLY
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

    // Redirect
    if (!isTikTokBrowser) {
      window.location.href = whatsappDeepLink;
      setTimeout(() => (window.location.href = whatsappFallback), 800);
    } else {
      window.location.href = whatsappFallback;
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE5DD] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Decorative background bubbles */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-72 h-72 rounded-full bg-green-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 w-80 h-80 rounded-full bg-emerald-300/30 blur-3xl" />

      {/* Chat container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-5 border border-green-200 relative">
        {/* Fake header */}
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

        {/* Chat bubbles */}
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

          {/* Typing indicator */}
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

        {/* CTA Button */}
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 text-lg"
          data-tt-action="click"
          data-tt-event="ClickButton"
          data-tt-content-id="whatsapp_join_cta"
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

import { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function JoinWhatsAppPage() {
  const [loading, setLoading] = useState(false);

  // 👉 Replace with your WhatsApp group inviteeeee OR dir chat link
  const whatsappLink = "https://chat.whatsapp.com/KEDtWmOvY6g9dKhDDLVV66";
  const whatsappDeepLink = "whatsapp://chat?code=KEDtWmOvY6g9dKhDDLVV66";

  const handleClick = () => {
    setLoading(true);

    // 🔥 TikTok event tracking
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("CompleteRegistration", {
        content_id: "whatsapp_tiktok_ads_class",
        content_type: "whatsapp_group",
      });
    }

    const ua = navigator.userAgent.toLowerCase();
    const isTikTokBrowser =
      ua.includes("tiktok") || ua.includes("bytedance") || ua.includes("aweme");

    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isTikTokBrowser) {
      if (isAndroid || isIOS) {
        // 🚀 Try WhatsApp deep link first
        window.location.href = whatsappDeepLink;

        // ⏱ Fallback to normal HTTPS link
        setTimeout(() => {
          window.location.href = whatsappLink;
        }, 700);
      } else {
        window.location.href = whatsappLink;
      }
    } else {
      // Normal browsers
      window.location.href = whatsappDeepLink;

      setTimeout(() => {
        window.location.href = whatsappLink;
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-green-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl" />

      {/* Chat container */}
      <div className="w-full max-w-md bg-[#111b21] rounded-xl shadow-2xl p-5 border border-green-900">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-xl">
            <FaWhatsapp />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">
              TikTok Ads Tutorial Class
            </h2>
            <p className="text-xs text-slate-400">
              WhatsApp Group • Limited Access
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="mt-4 space-y-3 text-[15px]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1f2c33] text-slate-200 p-3 rounded-lg max-w-[85%]"
          >
            👋 Welcome to the TikTok Ads Tutorial Class.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1f2c33] text-slate-200 p-3 rounded-lg max-w-[85%]"
          >
            💰 Learn how to run profitable TikTok ads step-by-step, even as a
            beginner.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#005c4b] text-white p-3 rounded-lg ml-auto max-w-[85%]"
          >
            I want to join the class 🚀
          </motion.div>

          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-1 bg-[#1f2c33] px-3 py-2 rounded-full w-max"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.96 }}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 text-lg"
          data-tt-event="CompleteRegistration"
          data-tt-content-id="whatsapp_tiktok_ads_class"
        >
          {loading ? (
            "Opening WhatsApp..."
          ) : (
            <>
              <FaWhatsapp size={22} />
              Join WhatsApp Class
            </>
          )}
        </motion.button>

        <p className="text-xs text-slate-400 text-center mt-3">
          You’ll be redirected to WhatsApp to join instantly.
        </p>
      </div>
    </div>
  );
}

JoinWhatsAppPage.hideLayout = true;

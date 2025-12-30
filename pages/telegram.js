import { useState } from "react";
import { motion } from "framer-motion";
import { FaTelegramPlane } from "react-icons/fa";

export default function JoinTelegramPage() {
  const [loading, setLoading] = useState(false);

  const telegramLink = "https://t.me/joshspottvmedia";

  const handleClick = () => {
    setLoading(true);

    // 🔥 Fire TikTok CompleteRegistration
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("CompleteRegistration", {
        content_id: "telegram_join_cta",
        content_type: "telegram_channel",
      });
    }

    const ua = navigator.userAgent.toLowerCase();
    const isTikTokBrowser =
      ua.includes("tiktok") || ua.includes("bytedance") || ua.includes("aweme");

    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isTikTokBrowser) {
      if (isAndroid) {
        // 🚀 Force Chrome
        const chromeIntent = `intent://${telegramLink.replace(
          "https://",
          ""
        )}#Intent;package=com.android.chrome;scheme=https;end`;

        window.location.href = chromeIntent;

        setTimeout(() => {
          window.location.href = telegramLink;
        }, 500);
      } else if (isIOS) {
        // 🚀 Force Safari
        window.location.href = telegramLink;
      } else {
        window.location.href = telegramLink;
      }
    } else {
      // Normal browsers
      window.location.href = telegramLink;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1621] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />

      {/* Chat container */}
      <div className="w-full max-w-md bg-[#17212b] rounded-xl shadow-2xl p-5 border border-sky-900">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
          <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-xl">
            <FaTelegramPlane />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">JOSHSPOT TV</h2>
            <p className="text-xs text-slate-400">Telegram Channel • Public</p>
          </div>
        </div>

        {/* Messages */}
        <div className="mt-4 space-y-3 text-[15px]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1f2c38] text-slate-200 p-3 rounded-lg max-w-[85%]"
          >
            👋 Welcome to Joshspot TV.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1f2c38] text-slate-200 p-3 rounded-lg max-w-[85%]"
          >
            🔥 Daily Nigerian stories you won’t see anywhere else.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#2b5278] text-white p-3 rounded-lg ml-auto max-w-[85%]"
          >
            I want to join and start reading 🚀
          </motion.div>

          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-1 bg-[#1f2c38] px-3 py-2 rounded-full w-max"
            >
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-300" />
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.96 }}
          className="mt-6 w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 text-lg"
          data-tt-event="CompleteRegistration"
          data-tt-content-id="telegram_join_cta"
        >
          {loading ? (
            "Opening Telegram..."
          ) : (
            <>
              <FaTelegramPlane size={22} />
              Join Telegram Channel
            </>
          )}
        </motion.button>

        <p className="text-xs text-slate-400 text-center mt-3">
          You’ll be redirected to Telegram to join instantly.
        </p>
      </div>
    </div>
  );
}

JoinTelegramPage.hideLayout = true;

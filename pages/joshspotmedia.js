import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function LandingPage() {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);

  const whatsappDeepLink = "whatsapp://chat?code=Irrp5QQCN2J2sXrMpNOnFH"; // triggers "Open with WhatsApp"
  const whatsappFallback = "https://chat.whatsapp.com/Irrp5QQCN2J2sXrMpNOnFH"; // fallback for browsers

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setIsTikTokBrowser(/tiktok/i.test(ua));
  }, []);

  // ✅ Add TikTok Pixel tracking here
  const handleClick = () => {
    // 🔹 TikTok tracking event
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("ClickButton", {
        content_name: "Join WhatsApp Group",
        value: 0,
        currency: "NGN",
        url: window.location.href,
      });
      console.log("✅ TikTok event tracked: Join WhatsApp Group");
    }

    // 🔹 WhatsApp redirect logic
    if (!isTikTokBrowser) {
      window.location.href = whatsappDeepLink;
      setTimeout(() => {
        window.location.href = whatsappFallback;
      }, 1000);
    } else {
      window.location.href = whatsappFallback;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-700 to-indigo-800 text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Floating shapes */}
      <motion.div
        className="absolute top-10 left-10 w-16 h-16 bg-yellow-400 rounded-full blur-xl opacity-60"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="absolute bottom-20 right-12 w-20 h-20 bg-green-400 rounded-full blur-xl opacity-50"
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
      />

      {/* Hero Section */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg"
      >
        🚀 Learn How to Run TikTok Ads <br /> That Drive{" "}
        <span className="text-yellow-300">Massive Sales!</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-6 text-lg md:text-2xl text-center max-w-2xl"
      >
        Join my{" "}
        <span className="font-bold text-green-300">FREE WhatsApp class</span>{" "}
        where I’ll show you step-by-step how to launch TikTok ads that actually
        convert customers.
      </motion.p>

      {/* TikTok Notice */}
      {isTikTokBrowser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-yellow-500/20 border border-yellow-400 text-yellow-200 rounded-xl px-5 py-3 text-center max-w-md"
        >
          ⚠️ You’re using TikTok’s in-app browser. When you click below, TikTok
          may show a small warning — just tap <b>“Continue”</b> to open
          WhatsApp.
        </motion.div>
      )}

      {/* Call to Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="mt-10 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-3 text-lg"
      >
        <FaWhatsapp size={24} /> Join WhatsApp Group
      </motion.button>

      {/* Floating bottom banner */}
      <motion.div
        className="absolute bottom-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl shadow-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm md:text-base">
          🔥 Limited spots available – Don’t miss out!
        </p>
      </motion.div>
    </div>
  );
}

LandingPage.hideLayout = true;

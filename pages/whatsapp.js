import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);
  const [externalId, setExternalId] = useState("");

  const whatsappDeepLink = "whatsapp://chat?code=IoFeOhgZ8y6GCogEKQA2VX";
  const whatsappFallback = "https://chat.whatsapp.com/IoFeOhgZ8y6GCogEKQA2VX";

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTok = /tiktok/i.test(ua);
    setIsTikTokBrowser(isTikTok);

    // generate or retrieve external_id
    let existingId = localStorage.getItem("external_id");
    if (!existingId) {
      existingId = uuidv4();
      localStorage.setItem("external_id", existingId);
    }
    setExternalId(existingId);

    // auto-trigger redirect logic
    const triggerRedirect = async () => {
      try {
        // send tracking event
        await fetch("/api/tiktok-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "AutoRedirect",
            external_id: existingId,
          }),
        });
      } catch (err) {
        console.warn("Tracking failed:", err);
      }

      // attempt deep link first (triggers system chooser popup)
      if (!isTikTok) {
        window.location.href = whatsappDeepLink;

        // fallback if WhatsApp isn’t installed
        setTimeout(() => {
          window.location.href = whatsappFallback;
        }, 1000);
      } else {
        // TikTok in-app browser → normal link (TikTok will show its “Be careful” prompt)
        window.location.href = whatsappFallback;
      }
    };

    // slight delay to ensure page mounts cleanly before redirecting
    const timer = setTimeout(triggerRedirect, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-700 to-indigo-800 text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg"
      >
        🚀 Learn How to Run TikTok Ads <br />
        That Drive <span className="text-yellow-300">Massive Sales!</span>
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

      {/* fallback manual button just in case redirect fails */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (window.location.href = whatsappFallback)}
        className="mt-10 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-3 text-lg"
      >
        <FaWhatsapp size={24} /> Join WhatsApp Group
      </motion.button>
    </div>
  );
}

RedirectToWhatsApp.hideLayout = true;

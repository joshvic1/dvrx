import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

export default function LandingPage() {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);
  const [externalId, setExternalId] = useState("");

  const whatsappDeepLink = "whatsapp://chat?code=Irrp5QQCN2J2sXrMpNOnFH";
  const whatsappFallback = "https://chat.whatsapp.com/Irrp5QQCN2J2sXrMpNOnFH";

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setIsTikTokBrowser(/tiktok/i.test(ua));

    // generate or retrieve external_id
    let existingId = localStorage.getItem("external_id");
    if (!existingId) {
      existingId = uuidv4();
      localStorage.setItem("external_id", existingId);
    }
    setExternalId(existingId);

    // ✅ Identify + Track ViewContent
    if (window.ttq) {
      window.ttq.identify({ external_id: existingId });

      window.ttq.track("ViewContent", {
        content_id: "whatsapp_join_click", // ✅ moved to root
        content_type: "product", // ✅ required by TikTok
        content_name: "Join WhatsApp Group",
        contents: [
          {
            content_id: "whatsapp_join_click",
            content_type: "product",
            content_name: "Join WhatsApp Group",
          },
        ],
        value: 0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      });
    }

    // ✅ Also send server-side event
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: existingId,
        content_id: "whatsapp_join_click",
        content_type: "product",
        content_name: "Join WhatsApp Group",
        value: 0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    });
  }, []);

  const handleClick = async () => {
    if (window.ttq) {
      // ✅ InitiateCheckout
      window.ttq.track("InitiateCheckout", {
        content_id: "whatsapp_join_click",
        content_type: "product",
        content_name: "Join WhatsApp Group",
        contents: [
          {
            content_id: "whatsapp_join_click",
            content_type: "product",
            content_name: "Join WhatsApp Group",
          },
        ],
        value: 0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      });

      // ✅ CompleteRegistration
      window.ttq.track("CompleteRegistration", {
        content_id: "whatsapp_group_registration",
        content_type: "product",
        content_name: "TikTok Ads Free Class",
        contents: [
          {
            content_id: "whatsapp_group_registration",
            content_type: "product",
            content_name: "TikTok Ads Free Class",
          },
        ],
        value: 0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      });
    }

    // ✅ Send to your backend too
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "CompleteRegistration",
        external_id: externalId,
        content_id: "whatsapp_group_registration",
        content_type: "product",
        content_name: "TikTok Ads Free Class",
        value: 0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    });

    // ✅ Redirect
    if (!isTikTokBrowser) {
      window.location.href = whatsappDeepLink;
      setTimeout(() => (window.location.href = whatsappFallback), 1000);
    } else {
      window.location.href = whatsappFallback;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-700 to-indigo-800 text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <motion.h1 className="text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg">
        🚀 Learn How to Run TikTok Ads <br />
        That Drive <span className="text-yellow-300">Massive Sales!</span>
      </motion.h1>

      <motion.p className="mt-6 text-lg md:text-2xl text-center max-w-2xl">
        Join my{" "}
        <span className="font-bold text-green-300">FREE WhatsApp class</span>{" "}
        where I’ll show you step-by-step how to launch TikTok ads that actually
        convert customers.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="mt-10 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-3 text-lg"
      >
        <FaWhatsapp size={24} /> Join WhatsApp Group
      </motion.button>
    </div>
  );
}

LandingPage.hideLayout = true;

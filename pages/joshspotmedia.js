import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

export default function LandingPage() {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);
  const [externalId, setExternalId] = useState("");

  const whatsappDeepLink = "whatsapp://chat?code=Irrp5QQCN2J2sXrMpNOnFH";
  const whatsappFallback = "https://chat.whatsapp.com/Irrp5QQCN2J2sXrMpNOnFH";

  // ✅ Helper: Send event to backend
  const sendTikTokEvent = async (eventName, props = {}) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: eventName,
            external_id: externalId,
            value: props.value || 0,
            currency: props.currency || "NGN",
            content_id: props.content_id || "",
            content_type: props.content_type || "",
            content_name: props.content_name || "",
            url: window.location.href,
          }),
        }
      );

      const data = await response.json();
      console.log(`✅ TikTok ${eventName} event sent:`, data);
    } catch (error) {
      console.error("❌ TikTok event failed:", error);
    }
  };

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

    // ✅ Identify user and track ViewContent
    if (window.ttq) {
      window.ttq.identify({ external_id: existingId });
      window.ttq.track("ViewContent", {
        value: 0,
        currency: "NGN",
        content_id: "landing_page_view",
        content_type: "page",
        content_name: "Joshspot Media WhatsApp Landing",
        url: window.location.href,
      });
    }

    // ✅ Send ViewContent server-side
    sendTikTokEvent("ViewContent", {
      value: 0,
      currency: "NGN",
      content_id: "landing_page_view",
      content_type: "page",
      content_name: "Joshspot Media WhatsApp Landing",
    });
  }, []);

  const handleClick = async () => {
    // ✅ Pixel-side InitiateCheckout
    if (window.ttq) {
      window.ttq.track("InitiateCheckout", {
        value: 0,
        currency: "NGN",
        content_id: "whatsapp_join_click",
        content_type: "button",
        content_name: "Join WhatsApp Group",
        url: window.location.href,
      });
    }

    // ✅ Server-side InitiateCheckout
    await sendTikTokEvent("InitiateCheckout", {
      value: 0,
      currency: "NGN",
      content_id: "whatsapp_join_click",
      content_type: "button",
      content_name: "Join WhatsApp Group",
    });

    // ✅ Pixel-side CompleteRegistration
    if (window.ttq) {
      window.ttq.track("CompleteRegistration", {
        value: 0,
        currency: "NGN",
        content_id: "whatsapp_group_registration",
        content_type: "signup",
        content_name: "TikTok Ads Free Class",
        url: window.location.href,
      });
    }

    // ✅ Server-side CompleteRegistration
    await sendTikTokEvent("CompleteRegistration", {
      value: 0,
      currency: "NGN",
      content_id: "whatsapp_group_registration",
      content_type: "signup",
      content_name: "TikTok Ads Free Class",
    });

    // ✅ Redirect user
    if (!isTikTokBrowser) {
      window.location.href = whatsappDeepLink;
      setTimeout(() => (window.location.href = whatsappFallback), 1000);
    } else {
      window.location.href = whatsappFallback;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-700 to-indigo-800 text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <motion.h1
        className="text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        🚀 Learn How to Run TikTok Ads <br />
        That Drive <span className="text-yellow-300">Massive Sales!</span>
      </motion.h1>

      <motion.p
        className="mt-6 text-lg md:text-2xl text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
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

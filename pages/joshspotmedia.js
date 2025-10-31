// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { FaWhatsapp } from "react-icons/fa";
// import { v4 as uuidv4 } from "uuid";

// export default function LandingPage() {
//   const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);
//   const [externalId, setExternalId] = useState("");

//   const whatsappDeepLink = "whatsapp://chat?code=FHPdD98MuZeLYB1NZcwJUD";
//   const whatsappFallback = "https://chat.whatsapp.com/FHPdD98MuZeLYB1NZcwJUD";

//   const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

//   useEffect(() => {
//     const ua = navigator.userAgent || "";
//     setIsTikTokBrowser(/tiktok/i.test(ua));

//     // generate or retrieve external_id
//     let existingId = localStorage.getItem("external_id");
//     if (!existingId) {
//       existingId = uuidv4();
//       localStorage.setItem("external_id", existingId);
//     }
//     setExternalId(existingId);

//     // ✅ Identify + Track ViewContent
//     if (window.ttq) {
//       window.ttq.identify({ external_id: existingId });

//       window.ttq.track("ViewContent", {
//         content_id: "whatsapp_join_click", // ✅ moved to root
//         content_type: "product", // ✅ required by TikTok
//         content_name: "Join WhatsApp Group",
//         contents: [
//           {
//             content_id: "whatsapp_join_click",
//             content_type: "product",
//             content_name: "Join WhatsApp Group",
//           },
//         ],
//         value: 0,
//         currency: "NGN",
//         event_time: Math.floor(Date.now() / 1000),
//         url: window.location.href,
//       });
//     }

//     // ✅ Also send server-side event
//     fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         event: "ViewContent",
//         external_id: existingId,
//         content_id: "whatsapp_join_click",
//         content_type: "product",
//         content_name: "Join WhatsApp Group",
//         value: 0,
//         currency: "NGN",
//         event_time: Math.floor(Date.now() / 1000),
//         url: window.location.href,
//       }),
//     });
//   }, []);

//   const handleClick = async () => {
//     if (window.ttq) {
//       // ✅ InitiateCheckout
//       window.ttq.track("InitiateCheckout", {
//         content_id: "whatsapp_join_click",
//         content_type: "product",
//         content_name: "Join WhatsApp Group",
//         contents: [
//           {
//             content_id: "whatsapp_join_click",
//             content_type: "product",
//             content_name: "Join WhatsApp Group",
//           },
//         ],
//         value: 0,
//         currency: "NGN",
//         event_time: Math.floor(Date.now() / 1000),
//         url: window.location.href,
//       });

//       // ✅ CompleteRegistration
//       window.ttq.track("CompleteRegistration", {
//         content_id: "whatsapp_group_registration",
//         content_type: "product",
//         content_name: "TikTok Ads Free Class",
//         contents: [
//           {
//             content_id: "whatsapp_group_registration",
//             content_type: "product",
//             content_name: "TikTok Ads Free Class",
//           },
//         ],
//         value: 0,
//         currency: "NGN",
//         event_time: Math.floor(Date.now() / 1000),
//         url: window.location.href,
//       });
//     }

//     // ✅ Send to your backend too
//     await fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         event: "CompleteRegistration",
//         external_id: externalId,
//         content_id: "whatsapp_group_registration",
//         content_type: "product",
//         content_name: "TikTok Ads Free Class",
//         value: 0,
//         currency: "NGN",
//         event_time: Math.floor(Date.now() / 1000),
//         url: window.location.href,
//       }),
//     });

//     // ✅ Redirect
//     if (!isTikTokBrowser) {
//       window.location.href = whatsappDeepLink;
//       setTimeout(() => (window.location.href = whatsappFallback), 1000);
//     } else {
//       window.location.href = whatsappFallback;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-purple-700 to-indigo-800 text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
//       <motion.button
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={handleClick}
//         className="mt-10 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-3 text-lg"
//       >
//         <FaWhatsapp size={24} /> Join Tiktok Training Class
//       </motion.button>
//     </div>
//   );
// }

// LandingPage.hideLayout = true;
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=HB4zJ2zHrCrLUx0Y1YJkYj";
  const whatsappFallback = "https://chat.whatsapp.com/HB4zJ2zHrCrLUx0Y1YJkYj";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // ✅ Generate or reuse user ID
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ 1. Fire ViewContent (user landed on redirect page)
    if (window.ttq) {
      window.ttq.identify({ external_id: externalId });
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: "whatsapp_redirect_page_group2",
            content_type: "product",
            content_name: "Join WhatsApp Group 2 Redirect",
          },
        ],
        value: 50.0,
        currency: "NGN",
      });
    }

    // 🔄 Send to backend
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: externalId,
        content_id: "whatsapp_redirect_page_group2",
        content_type: "product",
        content_name: "Join WhatsApp Group 2 Redirect",
        value: 50.0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    }).catch(() => {});

    // ✅ 2. Function to fire CompleteRegistration ONLY if WhatsApp actually opened
    const fireCompleteRegistration = () => {
      if (window.ttq) {
        window.ttq.track("CompleteRegistration", {
          contents: [
            {
              content_id: "whatsapp_join_success_group2",
              content_type: "product",
              content_name: "Joined WhatsApp Group 2",
            },
          ],
          value: 50.0,
          currency: "NGN",
        });
      }

      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "CompleteRegistration",
          external_id: externalId,
          content_id: "whatsapp_join_success_group2",
          content_type: "product",
          content_name: "Joined WhatsApp Group 2",
          value: 50.0,
          currency: "NGN",
          event_time: Math.floor(Date.now() / 1000),
          url: window.location.href,
        }),
      }).catch(() => {});
    };

    // ✅ 3. Track redirect behavior
    let registrationFired = false;
    let whatsappOpened = false;
    const startTime = Date.now();

    // Try opening WhatsApp app
    window.location.href = whatsappDeepLink;

    // Detect if WhatsApp actually opened
    const handleVisibilityChange = () => {
      if (!registrationFired && document.visibilityState === "hidden") {
        whatsappOpened = true;
        fireCompleteRegistration();
        registrationFired = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Fallback if WhatsApp app doesn’t open
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

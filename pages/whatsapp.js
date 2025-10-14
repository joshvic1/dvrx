import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToWhatsApp() {
  const whatsappDeepLink = "whatsapp://chat?code=JhuQzWQMYnYKirrN3NvrSS";
  const whatsappFallback = "https://chat.whatsapp.com/JhuQzWQMYnYKirrN3NvrSS";
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tiktok-event`;

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTikTokBrowser = /tiktok/i.test(ua);

    // ✅ Get or create external_id
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    // ✅ Fire ViewContent pixel
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.identify({ external_id: externalId });
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: "whatsapp_redirect_page",
            content_type: "product",
            content_name: "Join WhatsApp Group Redirect",
          },
        ],
        value: 50.0,
        currency: "NGN",
      });
    }

    // ✅ Send ViewContent server event
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "ViewContent",
        external_id: externalId,
        content_id: "whatsapp_redirect_page",
        content_type: "product",
        content_name: "Join WhatsApp Group Redirect",
        value: 50.0,
        currency: "NGN",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      }),
    }).catch(() => {});

    // 🧩 Function to fire CompleteRegistration event
    const fireCompleteRegistration = () => {
      if (window.ttq) {
        window.ttq.track("CompleteRegistration", {
          contents: [
            {
              content_id: "whatsapp_join_success",
              content_type: "product",
              content_name: "Joined WhatsApp Group",
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
          content_id: "whatsapp_join_success",
          content_type: "product",
          content_name: "Joined WhatsApp Group",
          value: 50.0,
          currency: "NGN",
          event_time: Math.floor(Date.now() / 1000),
          url: window.location.href,
        }),
      }).catch(() => {});
    };

    let hasFired = false;

    // ✅ Visibility trigger
    const handleVisibilityChange = () => {
      if (!hasFired && document.visibilityState === "hidden") {
        fireCompleteRegistration();
        hasFired = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ✅ Fallback timer trigger (fires if user stays 5s on page)
    const fallbackTimer = setTimeout(() => {
      if (!hasFired) {
        fireCompleteRegistration();
        hasFired = true;
      }
    }, 5000);

    // ✅ Redirect user to WhatsApp
    const redirectTimer = setTimeout(() => {
      if (!isTikTokBrowser) {
        window.location.href = whatsappDeepLink;
        setTimeout(() => (window.location.href = whatsappFallback), 1200);
      } else {
        window.location.href = whatsappFallback;
      }
    }, 1500);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(redirectTimer);
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

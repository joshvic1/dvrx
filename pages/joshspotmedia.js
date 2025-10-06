import React, { useEffect, useState } from "react";

const RedirectToWhatsApp = () => {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(null);
  const whatsappLink = "https://chat.whatsapp.com/C6eOrclQZfY6LLUW9GVjhq";

  useEffect(() => {
    if (typeof window === "undefined") return; // ensure it runs only in browser

    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isTikTok = /tiktok/i.test(ua);
    setIsTikTokBrowser(isTikTok);

    if (!isTikTok) {
      window.location.replace(whatsappLink);
      return;
    }

    // Try to open WhatsApp (may fail silently)
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = whatsappLink;
    document.body.appendChild(iframe);

    const timer = setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // While checking environment
  if (isTikTokBrowser === null) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Preparing your redirect...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {isTikTokBrowser ? (
        <>
          <h2>⚠️ TikTok Browser Detected</h2>
          <p>
            Tap the <b>three dots (⋯)</b> at the top-right corner and choose{" "}
            <b>“Open in browser”</b> to continue.
          </p>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#25D366",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.href = whatsappLink;
            }}
          >
            Try Opening WhatsApp
          </button>
        </>
      ) : (
        <h2>Redirecting you to WhatsApp...</h2>
      )}
    </div>
  );
};

export default RedirectToWhatsApp;

RedirectToWhatsApp.hideLayout = true;

import React, { useEffect, useState } from "react";

const RedirectToWhatsApp = () => {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);
  const whatsappLink = "https://chat.whatsapp.com/C6eOrclQZfY6LLUW9GVjhq"; // replace with your own number

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isTikTok = /tiktok/i.test(ua);
    setIsTikTokBrowser(isTikTok);

    if (!isTikTok) {
      // If not TikTok, redirect immediately to WhatsApp
      window.location.href = whatsappLink;
    } else {
      // Try to break out of TikTok browser
      const now = Date.now();
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = whatsappLink;
      document.body.appendChild(iframe);

      // After a short delay, prompt the user
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  }, []);

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
              // Attempt manual redirect if user clicks
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

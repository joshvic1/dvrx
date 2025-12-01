"use client";

import { v4 as uuidv4 } from "uuid";
import { FaWhatsapp, FaLink, FaBolt, FaShieldAlt } from "react-icons/fa";

export default function SignUpPage() {
  const handleClick = () => {
    let externalId = localStorage.getItem("external_id");
    if (!externalId) {
      externalId = uuidv4();
      localStorage.setItem("external_id", externalId);
    }

    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.identify({ external_id: externalId });

      window.ttq.track("ClickButton", {
        contents: [
          {
            content_id: "mytiklink_signup_button",
            content_type: "website",
            content_name: "Clicked signup button",
          },
        ],
        value: 1,
        currency: "NGN",
        description: "User clicked signup on MyTikLink",
        event_time: Math.floor(Date.now() / 1000),
        url: window.location.href,
      });
    }

    setTimeout(() => {
      window.location.href = "https://mytiklink.com/?auth=register";
    }, 300);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff0050]/20 via-transparent to-[#00f2ea]/10 blur-2xl animate-pulse" />

      {/* Floating Glow Circles */}
      <div className="absolute w-72 h-72 bg-[#ff0050]/30 rounded-full blur-[100px] top-10 left-10" />
      <div className="absolute w-72 h-72 bg-[#00f2ea]/30 rounded-full blur-[100px] bottom-10 right-10" />

      {/* PAGE CONTENT */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-16 text-center">
        {/* Hero Title */}
        <h1 className="text-3xl font-extrabold leading-tight mb-6">
          Your WhatsApp Link Not Working for TikTok Ads?
          <span className="block text-[#ff0050] mt-2">
            Fix it Instantly with MyTikLink
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-300 text-lg leading-relaxed mb-10">
          If your WhatsApp link has never worked on your TikTok advert or your
          WhatsApp link is not clickable on your bio, don't worry.{" "}
          <span className="text-white font-semibold">
            MyTikLink fixes it in seconds.
          </span>
        </p>

        {/* CTA Button */}
        <button
          onClick={handleClick}
          className="bg-[#ff0050] hover:bg-[#e60048] transition-all duration-300 text-white px-10 py-4 rounded-2xl text-xl font-semibold shadow-lg shadow-[#ff0050]/30 hover:scale-105"
        >
          Sign up on MyTikLink
        </button>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <FaWhatsapp className="text-3xl text-[#25D366] mx-auto mb-3" />
            <p className="font-semibold">Fix WhatsApp Block</p>
            <p className="text-gray-400 text-sm mt-1">
              Your link works instantly
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <FaLink className="text-3xl text-[#ff0050] mx-auto mb-3" />
            <p className="font-semibold">Works on TikTok Bio</p>
            <p className="text-gray-400 text-sm mt-1">Clickable & safe</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <FaBolt className="text-3xl text-yellow-400 mx-auto mb-3" />
            <p className="font-semibold">Fast Setup</p>
            <p className="text-gray-400 text-sm mt-1">
              Takes less than 30 seconds
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-gray-500 mt-10 text-sm">
          Trusted by creators • Works for TikTok Ads • No technical setup
        </p>
      </div>
    </div>
  );
}

SignUpPage.hideLayout = true;

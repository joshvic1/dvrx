// pages/api/tiktok-event.js
export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Access-Token": "385265baeebe5a2a99c50f3def4e9ce099f04c78", // ⚠️ keep secret
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_source: "web",
          event_source_id: "D3HREH3C77U2RE92SM40",
          event: "ClickButton",
          event_time: Math.floor(Date.now() / 1000),
          user: {
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            user_agent: req.headers["user-agent"],
          },
          properties: {
            content_name: "Join WhatsApp Group",
            url: req.headers.referer || "",
          },
        }),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

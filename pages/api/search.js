export default async function handler(req, res) {
  const { q } = req.query;

  try {
    if (!q || q.trim() === "") {
      return res.status(200).json([]);
    }

    // Replace with your backend base URL
    const backendBaseUrl =
      process.env.BACKEND_URL || "http://localhost:5000/api/products";

    const backendRes = await fetch(
      `${backendBaseUrl}/api/products?q=${encodeURIComponent(q)}`
    );
    const data = await backendRes.json();

    res.status(200).json(data);
  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json([]);
  }
}

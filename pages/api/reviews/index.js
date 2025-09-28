import dbConnect from "@/config/db";
import Review from "@/models/Review";
import Order from "@/models/Order";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { productId, customerEmail, rating, comment } = req.body;

      if (!customerEmail) {
        return res.status(400).json({ message: "Email is required" });
      }

      // ✅ Check if this email purchased the product
      const hasBought = await Order.findOne({
        customerEmail,
        "items.productId": productId,
        status: "completed",
      });

      if (!hasBought) {
        return res.status(403).json({
          message: "You must purchase this product before reviewing.",
        });
      }

      // ✅ Prevent duplicate reviews
      const alreadyReviewed = await Review.findOne({
        productId,
        customerEmail,
      });
      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ message: "You already reviewed this product." });
      }

      // ✅ Create review
      const review = await Review.create({
        productId,
        customerEmail,
        rating,
        comment,
      });

      res.status(201).json(review);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  if (req.method === "GET") {
    try {
      const { productId } = req.query;
      const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
      res.status(200).json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

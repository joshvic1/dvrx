// utils/recommendations.js

// Shuffle helper
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

/**
 * Build personalized recommendations
 * @param {Array} products - all products in the catalog
 * @param {Array} wishlist - products user has in wishlist (from context)
 * @param {Array} viewed - recently viewed products (from localStorage)
 * @param {Array} ordered - recently ordered products (from localStorage)
 */
export function getUserRecommendations(
  products,
  wishlist = [],
  viewed = [],
  ordered = []
) {
  const scores = {};

  // 1. Wishlist → +10
  wishlist.forEach((item) => {
    scores[item._id] = (scores[item._id] || 0) + 10;
  });

  // 2. Recently viewed → +7
  viewed.forEach((item) => {
    scores[item._id] = (scores[item._id] || 0) + 7;
  });

  // 3. Related to ordered → +6 (exclude exact ordered items)
  const orderedCategories = ordered.map((o) => o.category);
  const orderedSubCategories = ordered.map((o) => o.subCategory);

  products.forEach((p) => {
    if (ordered.some((o) => o._id === p._id)) return;

    if (
      orderedCategories.includes(p.category) ||
      orderedSubCategories.includes(p.subCategory)
    ) {
      scores[p._id] = (scores[p._id] || 0) + 6;
    }
  });

  // Build ranked list with small random factor
  let ranked = products
    .map((p) => ({
      ...p,
      score: (scores[p._id] || 0) + Math.random() * 2, // add random 0-2 points
    }))
    .filter((p) => p.score > 0);

  // Shuffle within similar scores
  ranked = shuffleArray(ranked).sort((a, b) => b.score - a.score);

  // Limit to top 50
  return ranked.slice(0, 50);
}

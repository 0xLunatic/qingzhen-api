// src/controllers/AppReviewController.js
const AppReviewService = require("../services/AppReviewService");

class AppReviewController {
  // POST /api/v1/app-reviews
  async submitReview(req, res) {
    try {
      const { rating, comment, name } = req.body;

      // Cek apakah user login (dari middleware auth)
      const user_id = req.user ? req.user.id : null;

      const review = await AppReviewService.createAppReview({
        user_id,
        guest_name: name, // Jika tidak login, pakai nama dari input form
        rating,
        comment,
      });

      res.status(201).json({
        success: true,
        message: "Thank you! Your review has been submitted.",
        data: review,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /api/v1/app-reviews/featured
  async getFeaturedReviews(req, res) {
    try {
      const reviews = await AppReviewService.getLandingPageReviews();

      // Format data agar mudah dibaca Frontend
      const formattedReviews = reviews.map((r) => ({
        id: r.id,
        // Jika ada user, pakai nama user. Jika tidak, pakai guest_name
        name: r.user ? r.user.name || r.user.username : r.guest_name,
        avatar: r.user ? r.user.avatar_url : null, // Frontend bisa kasih default avatar jika null
        rating: r.rating,
        text: r.comment,
      }));

      res.json({ success: true, data: formattedReviews });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AppReviewController();

// src/controllers/ReviewController.js
const ReviewService = require("../services/ReviewService");

class ReviewController {
  // POST /api/v1/reviews
  async addReview(req, res) {
    try {
      const { place_id, rating, comment, photos } = req.body;
      const user_id = req.user.id; // Didapat dari middleware JWT

      if (!place_id || !rating) {
        return res
          .status(400)
          .json({ message: "Place ID and Rating are required" });
      }

      const newReview = await ReviewService.createReview({
        place_id,
        user_id,
        rating,
        comment,
        photos,
      });

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: newReview,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  // GET /api/v1/reviews/:placeId
  async getPlaceReviews(req, res) {
    try {
      const { placeId } = req.params;
      const reviews = await ReviewService.getReviewsByPlace(placeId);

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ReviewController();

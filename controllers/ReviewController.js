// src/controllers/ReviewController.js
const ReviewService = require("../services/ReviewService");

class ReviewController {
  // POST /api/v1/reviews
  async getPlaceReviews(req, res) {
    try {
      const { placeId } = req.params;
      const reviews = await ReviewService.getReviewsByPlace(placeId);

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Add Review dengan Foto
  async addReview(req, res) {
    try {
      const userId = req.user.id;
      const { place_id, rating, comment } = req.body;

      let photoPaths = [];
      if (req.files && req.files.length > 0) {
        // 👇 PERBAIKAN: Pakai forward slash (/) manual, jangan path.join
        // Supaya formatnya selalu "/uploads/namafile.jpg" bukan "\uploads\namafile.jpg"
        photoPaths = req.files.map(
          (file) => `/uploads/places/${file.filename}`
        );
      }

      const newReview = await ReviewService.createReview({
        place_id,
        user_id: userId,
        rating,
        comment,
        photos: photoPaths,
      });

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: newReview,
      });
    } catch (error) {
      console.error("Add Review Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReviewController();

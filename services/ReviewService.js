// src/services/ReviewService.js
const Review = require("../models/Review");
const User = require("../models/User");

class ReviewService {
  // Create Review Baru
  async createReview(data) {
    try {
      const review = await Review.create({
        place_id: data.place_id,
        user_id: data.user_id,
        rating: data.rating,
        comment: data.comment,
        photos: data.photos || [],
      });
      return review;
    } catch (error) {
      throw new Error("Failed to create review: " + error.message);
    }
  }

  // Ambil Review berdasarkan Place ID
  async getReviewsByPlace(placeId) {
    try {
      const reviews = await Review.findAll({
        where: { place_id: placeId },
        order: [["created_at", "DESC"]], // Urutkan dari yang terbaru
        include: [
          {
            model: User,
            as: "user", // Sesuai alias di Model
            attributes: ["id", "username", "name", "avatar_url"], // Ambil info user secukupnya
          },
        ],
      });
      return reviews;
    } catch (error) {
      throw new Error("Failed to fetch reviews: " + error.message);
    }
  }
}

module.exports = new ReviewService();

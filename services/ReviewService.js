// src/services/ReviewService.js
const Review = require("../models/Review");
const User = require("../models/User");
const Place = require("../models/Place");

class ReviewService {
  // =========================
  // CREATE REVIEW
  // =========================
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

  // =========================
  // GET REVIEW BY PLACE
  // =========================

  // =========================
  // GET REVIEW BY ID
  // =========================
  async getReviewById(id) {
    try {
      const review = await Review.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ["id", "username", "name", "avatar_url"],
          },
          {
            model: Place,
            attributes: ["id", "name_en", "name_cn", "category"],
          },
        ],
      });

      if (!review) {
        throw new Error("Review not found");
      }

      return review;
    } catch (error) {
      throw new Error("Failed to fetch review: " + error.message);
    }
  }

  // =========================
  // UPDATE REVIEW
  // =========================
  async updateReview(id, data) {
    try {
      const review = await Review.findByPk(id);

      if (!review) {
        throw new Error("Review not found");
      }

      await review.update({
        rating: data.rating ?? review.rating,
        comment: data.comment ?? review.comment,
        photos: data.photos ?? review.photos,
      });

      return review;
    } catch (error) {
      throw new Error("Failed to update review: " + error.message);
    }
  }

  // =========================
  // DELETE REVIEW
  // =========================
  async deleteReview(id) {
    try {
      const review = await Review.findByPk(id);

      if (!review) {
        throw new Error("Review not found");
      }

      await review.destroy();

      return {
        message: "Review deleted successfully",
      };
    } catch (error) {
      throw new Error("Failed to delete review: " + error.message);
    }
  }
}

module.exports = new ReviewService();

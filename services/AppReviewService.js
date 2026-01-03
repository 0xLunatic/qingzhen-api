// src/services/AppReviewService.js
const AppReview = require("../models/AppReview");
const User = require("../models/User");

class AppReviewService {
  // Submit Review Baru
  async createAppReview(data) {
    // Jika user login, user_id ada. Jika tidak, pakai guest_name.
    return await AppReview.create({
      user_id: data.user_id || null,
      guest_name: data.guest_name || "Anonymous",
      rating: data.rating,
      comment: data.comment,
      is_featured: false, // Default false, harus di-approve admin agar tampil
    });
  }

  // Ambil Review untuk Landing Page (Hanya yang is_featured = true)
  async getLandingPageReviews() {
    // 1. Coba cari review yang di-set FEATURED oleh admin
    let reviews = await AppReview.findAll({
      where: { is_featured: true },
      limit: 3,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "username", "avatar_url"],
        },
      ],
    });

    // 2. Fallback: Jika TIDAK ADA featured review, ambil 3 review TERBARU (apapun statusnya)
    if (reviews.length === 0) {
      reviews = await AppReview.findAll({
        limit: 3,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "username", "avatar_url"],
          },
        ],
      });
    }

    return reviews;
  }

  // (Optional) Admin approve review
  async approveReview(reviewId) {
    return await AppReview.update(
      { is_featured: true },
      { where: { id: reviewId } }
    );
  }
}

module.exports = new AppReviewService();

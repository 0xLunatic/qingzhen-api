// src/controllers/ReviewController.js
const Review = require("../models/Review");
const User = require("../models/User");
const Place = require("../models/Place");
const sequelize = require("../config/database");

class ReviewController {
  // 1. Get Reviews by Place ID
  async getPlaceReviews(req, res) {
    try {
      let { placeId } = req.params;

      // GUARD: Cek ID kosong
      if (!placeId) return res.json({ success: true, data: [] });

      // LOGIC PENCARIAN ID
      // Jika request membawa ID OSM (misal: "osm-12345")
      if (placeId.toString().startsWith("osm-")) {
        const osmId = placeId.replace("osm-", "");

        // Cari tempat di database kita yang punya osm_id tersebut
        const place = await Place.findOne({ where: { osm_id: String(osmId) } });

        if (!place) {
          // Jika belum ada di DB kita, berarti pasti belum ada review
          return res.json({ success: true, data: [] });
        }

        // Jika ketemu, gunakan ID database-nya untuk cari review
        placeId = place.id;
      }

      // Validasi ID Database (harus angka)
      if (isNaN(placeId)) {
        return res.json({ success: true, data: [] });
      }

      // Query Review seperti biasa
      const reviews = await Review.findAll({
        where: { place_id: placeId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "username", "avatar_url"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error("🔥 Error getting reviews:", error);
      res.status(500).json({
        success: false,
        message: "Server Error fetching reviews",
        error: error.message,
      });
    }
  }

  // 2. Add New Review (Smart Logic)
  async addReview(req, res) {
    const t = await sequelize.transaction();

    try {
      // 👇 UPDATE 1: Terima 'category' dari body
      const {
        rating,
        comment,
        is_osm,
        osm_id,
        name,
        address,
        lat,
        lng,
        category,
      } = req.body;

      let { place_id } = req.body;
      const userId = req.user.id;

      // --- LOGIC A: JIKA INI TEMPAT DARI OSM ---
      if (is_osm === "true" || is_osm === true) {
        let place = await Place.findOne({
          where: { osm_id: String(osm_id) },
          transaction: t,
        });

        if (!place) {
          if (!name || !lat || !lng) {
            await t.rollback();
            return res.status(400).json({ message: "Missing OSM data info" });
          }

          // 👇 UPDATE 2: Gunakan kategori yang dikirim, atau default ke Restaurant
          // Pastikan value category sesuai dengan ENUM di database ('Restaurant', 'Mosque', 'Market')
          const validCategory = ["Restaurant", "Mosque", "Market"].includes(
            category
          )
            ? category
            : "Restaurant";

          place = await Place.create(
            {
              osm_id: String(osm_id),
              name_en: name,
              category: validCategory, // 👈 SUDAH DINAMIS
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
              address: address || "Nearby Location",
              halal_status: validCategory === "Mosque" ? "Verified" : "No Pork", // Auto verified kalau masjid
              is_verified: true,
              contributor_id: userId,
            },
            { transaction: t }
          );
        }
        place_id = place.id;
      }

      // --- LOGIC B: VALIDASI ID AKHIR ---
      if (!place_id) {
        await t.rollback();
        return res.status(400).json({ message: "Place ID is required" });
      }

      let photosArray = [];
      if (req.files && req.files.length > 0) {
        photosArray = req.files.map((f) => `/uploads/places/${f.filename}`);
      }

      const newReview = await Review.create(
        {
          user_id: userId,
          place_id: place_id,
          rating: parseInt(rating),
          comment: comment,
          photos: photosArray,
        },
        { transaction: t }
      );

      await t.commit();

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: newReview,
      });
    } catch (error) {
      await t.rollback();
      console.error("🔥 Error adding review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add review",
        error: error.message,
      });
    }
  }
}

module.exports = new ReviewController();

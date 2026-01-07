// src/controllers/PlaceController.js
const Place = require("../models/Place");
const User = require("../models/User");
const Review = require("../models/Review");
const sequelize = require("../config/database");

class PlaceController {
  // 1. Ambil Semua Tempat (Public)
  async getAllPlaces(req, res) {
    try {
      const places = await Place.findAll({
        where: { is_verified: true },
        attributes: {
          include: [
            [sequelize.fn("AVG", sequelize.col("reviews.rating")), "avgRating"],
            [sequelize.fn("COUNT", sequelize.col("reviews.id")), "reviewCount"],
          ],
        },
        include: [
          {
            model: User,
            as: "contributor",
            attributes: ["name", "username", "avatar_url"],
          },
          {
            model: Review,
            as: "reviews",
            attributes: [],
          },
        ],
        group: ["Place.id", "contributor.id"],
        order: [["created_at", "DESC"]],
      });

      res.json({
        success: true,
        data: places,
      });
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. User Kontribusi Tempat Baru
  async contributePlace(req, res) {
    try {
      const {
        name_en,
        name_cn,
        latitude,
        longitude,
        address,
        category,
        halal_status,
        food_type,
        promo_details,
      } = req.body;

      // Validasi input dasar
      if (!name_en || !latitude || !longitude || !category) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // --- LOGIC GAMBAR (IMAGE_URL) ---
      let mainImageUrl = null; // Untuk kolom image_url
      let photosArray = []; // Untuk kolom photos (JSON)

      // req.files berasal dari Multer (upload.array('photos'))
      if (req.files && req.files.length > 0) {
        // 1. Buat array path untuk semua foto
        photosArray = req.files.map((f) => `/uploads/places/${f.filename}`);

        // 2. Ambil foto PERTAMA sebagai Cover Image (image_url)
        mainImageUrl = photosArray[0];
      }

      const newPlace = await Place.create({
        name_en,
        name_cn,
        latitude,
        longitude,
        address,
        category,
        halal_status: halal_status || "No Pork",
        food_type,
        promo_details,
        is_promo: !!promo_details,

        // 👇 SIMPAN KE DATABASE
        image_url: mainImageUrl, // Foto Cover
        photos: photosArray, // Foto Gallery (JSON Array)

        contributor_id: req.user.id,
        is_verified: false, // Default false (menunggu admin)
      });

      res.status(201).json({
        success: true,
        message: "Place submitted for review!",
        data: newPlace,
      });
    } catch (error) {
      console.error("Contribute Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Contributor Update Place (Self Edit)
  async updateMyPlace(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const place = await Place.findByPk(id);
      if (!place) return res.status(404).json({ message: "Place not found" });

      // Cek Kepemilikan
      if (place.contributor_id !== userId) {
        return res
          .status(403)
          .json({ message: "You are not the owner of this place" });
      }

      // Siapkan data update
      const updateData = { ...req.body };

      // Hapus field sensitif agar tidak bisa diubah user
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.is_verified;
      delete updateData.contributor_id;

      // --- LOGIC UPDATE GAMBAR ---
      // Jika user mengupload foto baru saat edit
      if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map((f) => `/uploads/places/${f.filename}`);

        // Update image_url dengan foto baru yang pertama
        updateData.image_url = newPhotos[0];

        // Update gallery (opsional: bisa replace total atau push, disini kita replace)
        updateData.photos = newPhotos;
      }

      await place.update(updateData);

      res.json({ success: true, message: "Place updated successfully" });
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PlaceController();

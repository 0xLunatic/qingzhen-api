// src/controllers/AdminController.js
const User = require("../models/User");
const Place = require("../models/Place");
const UserVisit = require("../models/UserVisit");

class AdminController {
  // ==========================================
  // 1. DASHBOARD & STATS
  // ==========================================
  async getStats(req, res) {
    try {
      const totalUsers = await User.count();
      const totalPlaces = await Place.count();

      // Pending = Belum diverifikasi
      const pendingPlaces = await Place.count({
        where: { is_verified: false },
      });

      const totalReviews = await UserVisit.count({
        where: { status: "Visited" },
      });

      res.json({
        success: true,
        data: { totalUsers, totalPlaces, pendingPlaces, totalReviews },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 2. USER MANAGEMENT
  // ==========================================
  async getUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password_hash"] },
        order: [["created_at", "DESC"]],
      });
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ["user", "contributor", "admin"];
      if (!validRoles.includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role" });
      }

      const updated = await User.update({ role }, { where: { id } });

      if (updated[0] === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: `User role updated to ${role}` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      await User.destroy({ where: { id: req.params.id } });
      res.json({ success: true, message: "User deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 3. PLACE MANAGEMENT (CRUD LENGKAP)
  // ==========================================

  // A. Ambil Semua (Termasuk Unverified untuk dicek Admin)
  async getAllPlaces(req, res) {
    try {
      const places = await Place.findAll({
        include: [
          {
            model: User,
            as: "contributor",
            attributes: ["name", "username"],
          },
        ],
        order: [
          ["is_verified", "ASC"], // Unverified (0) di paling atas
          ["created_at", "DESC"], // Paling baru di atas
        ],
      });
      res.json({ success: true, data: places });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // B. Ambil Detail (Untuk Form Edit)
  async getPlaceById(req, res) {
    try {
      const place = await Place.findByPk(req.params.id);
      if (!place) {
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      }
      res.json({ success: true, data: place });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // C. Create Place (Admin - Langsung Verified)
  async createPlace(req, res) {
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

      if (!name_en || !latitude || !longitude || !category) {
        return res
          .status(400)
          .json({ success: false, message: "Missing fields" });
      }

      // Logic Gambar
      let mainImageUrl = null;
      let photosArray = [];
      if (req.files && req.files.length > 0) {
        photosArray = req.files.map((f) => `/uploads/places/${f.filename}`);
        mainImageUrl = photosArray[0];
      }

      const newPlace = await Place.create({
        name_en,
        name_cn,
        latitude,
        longitude,
        address,
        category,
        halal_status: halal_status || "Verified",
        food_type,
        promo_details,
        is_promo: !!promo_details,

        image_url: mainImageUrl, // Simpan ke kolom baru
        photos: photosArray,

        contributor_id: req.user.id, // Admin sebagai creator
        is_verified: true, // Langsung verified karena admin yg buat
      });

      res.json({ success: true, message: "Place created", data: newPlace });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // D. Update Place
  async updatePlace(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Hapus field sensitif
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.contributor_id;

      // Logic Gambar: Hanya update jika ada file baru diupload
      if (req.files && req.files.length > 0) {
        const photosArray = req.files.map(
          (f) => `/uploads/places/${f.filename}`
        );
        updateData.image_url = photosArray[0]; // Ganti foto utama
        updateData.photos = photosArray; // Ganti galeri
      }

      const [updated] = await Place.update(updateData, { where: { id } });

      if (updated === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      }

      res.json({ success: true, message: "Place updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // E. Verify Place (Quick Action)
  async verifyPlace(req, res) {
    try {
      await Place.update(
        {
          halal_status: "Verified",
          is_verified: true,
        },
        { where: { id: req.params.id } }
      );
      res.json({ success: true, message: "Place verified successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // F. Delete Place
  async deletePlace(req, res) {
    try {
      // (Opsional: Hapus file gambar dari server di sini menggunakan fs.unlink)

      const deleted = await Place.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ message: "Not found" });

      res.json({ success: true, message: "Place deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();

// src/services/PlaceService.js
const Place = require("../models/Place");
const User = require("../models/User");

class PlaceService {
  // 1. User Submit Tempat Baru
  async proposePlace(data, userId) {
    return await Place.create({
      ...data,
      contributor_id: userId,
      is_verified: false, // Wajib verifikasi admin dulu (atau true jika ingin langsung tampil)
    });
  }

  // 2. Ambil Semua Tempat (Untuk ditampilkan di Peta - Gabungan Verified & Unverified?)
  // Biasanya User biasa hanya melihat yang Verified
  async getVerifiedPlaces() {
    return await Place.findAll({
      where: { is_verified: true },
      include: [
        {
          model: User,
          as: "contributor",
          attributes: ["username", "name"], // Credit ke kontributor
        },
      ],
    });
  }

  // 3. (Opsional) User melihat submission mereka sendiri
  async getMySubmissions(userId) {
    return await Place.findAll({
      where: { contributor_id: userId },
      order: [["created_at", "DESC"]],
    });
  }
}

module.exports = new PlaceService();

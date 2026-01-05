// src/controllers/PlaceController.js
const PlaceService = require("../services/PlaceService");

class PlaceController {
  // POST /api/v1/places/contribute
  // Di dalam method contributePlace:
  async contributePlace(req, res) {
    try {
      const userId = req.user.id;

      // 🔍 DEBUGGING: Cek di terminal backend saat submit
      console.log("Body:", req.body);
      console.log("Files:", req.files);

      // 1. Proses File Foto
      let photoPaths = [];
      if (req.files && req.files.length > 0) {
        // Map file yang diupload menjadi URL path
        photoPaths = req.files.map(
          (file) => `/uploads/places/${file.filename}`
        );
      }

      // 2. Simpan ke Service
      const placeData = {
        ...req.body,
        photos: photoPaths, // 👈 Masukkan array path foto kesini
      };

      const newPlace = await PlaceService.proposePlace(placeData, userId);

      res.status(201).json({
        success: true,
        message: "Place submitted successfully!",
        data: newPlace,
      });
    } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({ message: error.message });
    }
  }
  // GET /api/v1/places
  async getPlacesForMap(req, res) {
    try {
      // Ambil data dari DB kita (Contributors Map)
      const places = await PlaceService.getVerifiedPlaces();

      res.json({
        success: true,
        data: places,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PlaceController();

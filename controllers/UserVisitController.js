// src/controllers/UserVisitController.js
const UserVisit = require("../models/UserVisit");

class UserVisitController {
  // Toggle Status (Visited / Wishlist)
  // Jika sudah ada dengan status sama -> Hapus (Untoggle)
  // Jika sudah ada status beda -> Update
  // Jika belum ada -> Create
  async toggleVisitStatus(req, res) {
    try {
      const user_id = req.user.id;
      const { place_id, status } = req.body; // status: 'Visited' or 'Wishlist'

      // Cek apakah sudah pernah ditandai
      const existingVisit = await UserVisit.findOne({
        where: { user_id, place_id },
      });

      if (existingVisit) {
        if (existingVisit.status === status) {
          // Kalau status sama (misal klik Visited lagi), maka hapus (unmark)
          await existingVisit.destroy();
          return res.json({
            success: true,
            message: "Removed form list",
            data: null,
          });
        } else {
          // Kalau status beda (misal dari Wishlist jadi Visited), update
          existingVisit.status = status;
          existingVisit.visited_at = new Date();
          await existingVisit.save();
          return res.json({
            success: true,
            message: `Updated to ${status}`,
            data: existingVisit,
          });
        }
      } else {
        // Buat baru
        const newVisit = await UserVisit.create({
          user_id,
          place_id,
          status,
        });
        return res.json({
          success: true,
          message: `Marked as ${status}`,
          data: newVisit,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }

  // Ambil semua data visit user (untuk inisialisasi frontend)
  async getMyVisits(req, res) {
    try {
      const user_id = req.user.id;
      const visits = await UserVisit.findAll({
        where: { user_id },
        attributes: ["place_id", "status"], // Kita cuma butuh ID dan status buat mapping di frontend
      });
      res.json({ success: true, data: visits });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
}

module.exports = new UserVisitController();

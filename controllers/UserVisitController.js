const UserVisit = require("../models/UserVisit");

class UserVisitController {
  // 1. Toggle Status (Visited / Wishlist / Hapus)
  async toggleVisitStatus(req, res) {
    try {
      const user_id = req.user.id; // Dari middleware auth
      const { place_id, status } = req.body; // Dari frontend: { place_id: 1, status: 'Visited' }

      // Cek apakah sudah ada datanya
      const existing = await UserVisit.findOne({
        where: { user_id, place_id },
      });

      if (existing) {
        if (existing.status === status) {
          // Kalau status sama (misal Visited diklik lagi) -> HAPUS (Unmark)
          await existing.destroy();
          return res.json({ success: true, message: "Removed from list" });
        } else {
          // Kalau status beda (misal dari Wishlist jadi Visited) -> UPDATE
          existing.status = status;
          existing.visited_at = new Date();
          await existing.save();
          return res.json({ success: true, message: `Updated to ${status}` });
        }
      } else {
        // Belum ada -> BUAT BARU
        await UserVisit.create({
          user_id,
          place_id,
          status,
          visited_at: new Date(),
        });
        return res.json({ success: true, message: `Marked as ${status}` });
      }
    } catch (error) {
      console.error("Error toggle visit:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }

  // 2. Ambil Data Visit User (Dipakai frontend saat load map)
  async getMyVisits(req, res) {
    try {
      const user_id = req.user.id;
      const visits = await UserVisit.findAll({
        where: { user_id },
        attributes: ["place_id", "status"], // Frontend cuma butuh ini buat mapping warna badge
      });
      res.json({ success: true, data: visits });
    } catch (error) {
      console.error("Error get visits:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
}

module.exports = new UserVisitController();

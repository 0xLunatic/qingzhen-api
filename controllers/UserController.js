// src/controllers/UserController.js
const User = require("../models/User");

class UserController {
  // Get Profile Sendiri
  async getMyProfile(req, res) {
    try {
      // req.user.id didapat dari middleware JWT
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password_hash"] }, // Jangan kirim password
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update Profile (Bio, Location, Name)
  async updateProfile(req, res) {
    try {
      const { name, username, bio, location } = req.body; // 👈 Ambil 'name' dari body

      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Update fields
      if (name) user.name = name; // 👈 Update nama
      if (username) user.username = username;
      if (bio) user.bio = bio;
      if (location) user.location = location;

      await user.save();

      res.json({
        success: true,
        message: "Profile updated",
        data: {
          name: user.name,
          username: user.username,
          bio: user.bio,
          location: user.location,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Upload Avatar
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findByPk(req.user.id);

      // Simpan path gambar ke database
      // URL bisa disesuaikan dengan domain server nanti
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      user.avatar_url = avatarUrl;

      // Bonus: Tambah Poin saat upload foto profil (Gamifikasi)
      if (user.points < 50) {
        // Hanya dapet poin sekali/awal
        user.points += 50;
      }

      await user.save();

      res.json({
        success: true,
        message: "Avatar updated successfully",
        data: { avatar_url: avatarUrl, points: user.points },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();

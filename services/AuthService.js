// src/services/AuthService.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

class AuthService {
  constructor() {
    this.saltRounds = 12; // High security salt
    this.jwtSecret = process.env.JWT_SECRET || "sangat_rahasia_dan_panjang";
  }

  // --- 1. REGISTER ---
  async registerUser(data) {
    // Cek duplikasi (Username / Email / Phone)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { phone_number: data.phone_number },
          { email: data.email || "" },
          { username: data.username || "" },
        ],
      },
    });

    if (existingUser) {
      throw new Error("User already exists (Check phone/email/username)");
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    // Create User
    const newUser = await User.create({
      name: data.name || null, // 👈 Simpan nama
      username: data.username,
      email: data.email,
      phone_number: data.phone_number,
      password_hash: hashedPassword,
      role: "user",
    });

    return this.generateToken(newUser);
  }

  // --- 2. LOGIN (Multi-method: Phone/Email/Username) ---
  async loginUser(identifier, password) {
    // Mencari user berdasarkan Email ATAU Phone ATAU Username
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { phone_number: identifier },
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password_hash) {
      throw new Error("This account uses Social Login");
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return this.generateToken(user);
  }

  // --- 3. SOCIAL LOGIN (WeChat / Apple) ---
  // Logikanya: Cek ID, kalau ada login, kalau tidak ada create baru
  async loginWithSocial(provider, socialId, phoneNumber = null) {
    const field = provider === "wechat" ? "wechat_id" : "apple_id";

    let user = await User.findOne({ where: { [field]: socialId } });

    if (!user) {
      // Auto-register jika belum ada
      if (!phoneNumber)
        throw new Error("Phone number required for first time social login");

      user = await User.create({
        [field]: socialId,
        phone_number: phoneNumber,
        role: "user",
      });
    }

    return this.generateToken(user);
  }

  // Helper: Generate JWT
  generateToken(user) {
    const payload = {
      id: user.id,
      role: user.role,
      username: user.username,
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: "1d" });

    return {
      user: {
        id: user.id,
        name: user.name, // 👈 WAJIB DITAMBAHKAN DI SINI
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        avatar_url: user.avatar_url, // Tambahkan juga ini jika mau menampilkan avatar
      },
      token,
    };
  }
}

module.exports = new AuthService();

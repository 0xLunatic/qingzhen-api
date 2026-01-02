const { Sequelize } = require("sequelize");
require("dotenv").config(); // Memuat variabel dari file .env

// Inisialisasi Koneksi Sequelize untuk MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME, // Nama Database
  process.env.DB_USER, // Username Database
  process.env.DB_PASSWORD, // Password Database
  {
    host: process.env.DB_HOST, // Host (biasanya localhost atau IP server)
    dialect: "mysql", // 👈 PENTING: Ganti ke mysql
    port: process.env.DB_PORT || 3306, // Port default MySQL
    logging: false, // Set true jika ingin melihat raw SQL query di terminal

    // Konfigurasi Pool Koneksi (Penting untuk performa & kestabilan)
    pool: {
      max: 10, // Maksimal koneksi terbuka
      min: 0, // Minimal koneksi
      acquire: 30000, // Waktu tunggu maksimal sebelum error (ms)
      idle: 10000, // Waktu idle sebelum koneksi diputus (ms)
    },

    // Pengaturan Timezone (Opsional, agar sesuai waktu server)
    timezone: "+07:00", // WIB (Sesuaikan jika perlu, atau hapus untuk UTC)
  }
);

// Test Koneksi (Optional, hanya berjalan saat file ini di-load pertama kali)
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection to MySQL has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;

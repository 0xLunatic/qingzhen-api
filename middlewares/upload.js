// src/middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder tujuan ada
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Konfigurasi Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = "public/uploads/others"; // Default

    // Tentukan folder berdasarkan field name atau route
    if (file.fieldname === "photos") {
      dest = "public/uploads/places";
    } else if (file.fieldname === "avatar") {
      dest = "public/uploads/avatars";
    }

    ensureDir(dest); // Buat folder jika belum ada
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Nama file: timestamp-random.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: fileFilter,
});

module.exports = upload;

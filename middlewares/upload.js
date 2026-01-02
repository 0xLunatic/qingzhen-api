// src/middlewares/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder ada
const uploadDir = "public/uploads/avatars";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format nama file: USERID-TIMESTAMP.ext (agar unik)
    // Karena req.user.id didapat dari middleware auth (JWT)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Filter File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: fileFilter,
});

module.exports = upload;

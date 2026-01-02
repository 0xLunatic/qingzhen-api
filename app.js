// app.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");

// --- CONTROLLERS ---
const AuthController = require("./controllers/AuthController");
const UserController = require("./controllers/UserController");

// --- MIDDLEWARES ---
const { validateRegister } = require("./middlewares/validation"); // Pastikan file lowercase 'validation.js'
const authLimiter = require("./middlewares/rateLimiter");
const authenticateToken = require("./middlewares/authMiddleware"); // Middleware cek login
const upload = require("./middlewares/upload"); // Middleware upload foto

const app = express();

// --- 1. GLOBAL MIDDLEWARES (SECURITY & CONFIG) ---
app.use(helmet()); // Secure HTTP Headers
app.use(cors()); // Handle Cross-Origin Resource Sharing
app.use(express.json()); // Parsing JSON Body
app.use(express.urlencoded({ extended: true })); // Parsing Form Data

// 👉 STATIC FILES: Agar gambar profil bisa diakses via URL
// Contoh: http://localhost:5000/uploads/avatars/avatar-123.jpg
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- 2. API ROUTES ---
const router = express.Router();

// === A. AUTHENTICATION ROUTES ===
// Register (Protected with Validation)
router.post("/auth/register", validateRegister, (req, res) =>
  AuthController.register(req, res)
);

// Login (Protected with Rate Limiter)
router.post("/auth/login", authLimiter, (req, res) =>
  AuthController.login(req, res)
);

// Social Login (WeChat/Apple)
router.post("/auth/social", (req, res) => AuthController.socialLogin(req, res));

// === B. USER PROFILE ROUTES (NEW) ===
// Get Profile Saya (Harus Login)
router.get("/user/me", authenticateToken, (req, res) =>
  UserController.getMyProfile(req, res)
);

// Update Text Profile (Bio, Username, Location)
router.put("/user/profile", authenticateToken, (req, res) =>
  UserController.updateProfile(req, res)
);

// Upload Foto Profil (Multipart Form Data)
router.post(
  "/user/avatar",
  authenticateToken,
  upload.single("avatar"),
  (req, res) => UserController.uploadAvatar(req, res)
);

// Pasang Router ke Path Utama
app.use("/api/v1", router);

// --- 3. SERVER START & DB SYNC ---
const PORT = process.env.PORT || 5000;

sequelize
  // alter: true -> Otomatis update kolom tabel jika ada perubahan di Model (tambah kolom avatar, dll)
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database connected & Tables synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Local Link: http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB Error:", err));

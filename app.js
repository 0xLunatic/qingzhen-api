// app.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");

// --- CONTROLLERS ---
const AuthController = require("./controllers/AuthController");
const UserController = require("./controllers/UserController");
const ReviewController = require("./controllers/ReviewController");
const AppReviewController = require("./controllers/AppReviewController");

// --- MIDDLEWARES ---
const { validateRegister } = require("./middlewares/validation"); // Pastikan file lowercase 'validation.js'
const authLimiter = require("./middlewares/rateLimiter");
const authenticateToken = require("./middlewares/authMiddleware"); // Middleware cek login
const upload = require("./middlewares/upload"); // Middleware upload foto

const app = express();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    const jwt = require("jsonwebtoken");
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
    } catch (err) {
      console.log("Invalid token in optional auth");
    }
  }
  next();
};

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

// --- ROUTES REVIEWS ---

// 1. Get Reviews untuk tempat tertentu (Public - tidak butuh login)
router.get("/reviews/:placeId", (req, res) =>
  ReviewController.getPlaceReviews(req, res)
);

// 2. Post Review (Protected - harus login)
router.post("/reviews", authenticateToken, (req, res) =>
  ReviewController.addReview(req, res)
);

// --- ROUTES APP REVIEWS (TESTIMONIALS) ---

// 1. Submit Review Aplikasi (Landing Page)
router.post("/app-reviews", optionalAuth, (req, res) =>
  AppReviewController.submitReview(req, res)
);

// 2. Get Featured Reviews (Untuk ditampilkan di Landing Page)
router.get("/app-reviews/featured", (req, res) =>
  AppReviewController.getFeaturedReviews(req, res)
);

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

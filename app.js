// app.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const sequelize = require("./config/database");

require("./models/associations"); // Baris 9

// --- CONTROLLERS ---
const AuthController = require("./controllers/AuthController");
const UserController = require("./controllers/UserController");
const ReviewController = require("./controllers/ReviewController");
const AppReviewController = require("./controllers/AppReviewController");
const PlaceController = require("./controllers/PlaceController");
const UserVisitController = require("./controllers/UserVisitController");
const AdminController = require("./controllers/AdminController");

// --- MIDDLEWARES ---
const { validateRegister } = require("./middlewares/validation");
const authLimiter = require("./middlewares/rateLimiter");
const authenticateToken = require("./middlewares/authMiddleware");
const upload = require("./middlewares/upload");
const authenticateAdmin = require("./middlewares/authAdmin");

const app = express();

// Middleware Optional Auth (Untuk fitur yang bisa diakses guest/user)
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
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 👉 STATIC FILES: Agar gambar profil/tempat bisa diakses via URL
// Akses: http://localhost:5000/uploads/places/namafile.jpg
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- 2. API ROUTES ---
const router = express.Router();

// ==============================
// A. AUTHENTICATION ROUTES
// ==============================
router.post("/auth/register", validateRegister, (req, res) =>
  AuthController.register(req, res)
);
router.post("/auth/login", authLimiter, (req, res) =>
  AuthController.login(req, res)
);
router.post("/auth/social", (req, res) => AuthController.socialLogin(req, res));

// ==============================
// B. USER PROFILE ROUTES
// ==============================
router.get("/user/me", authenticateToken, (req, res) =>
  UserController.getMyProfile(req, res)
);
router.put("/user/profile", authenticateToken, (req, res) =>
  UserController.updateProfile(req, res)
);
// Upload Avatar (Single File)
router.post(
  "/user/avatar",
  authenticateToken,
  upload.single("avatar"),
  (req, res) => UserController.uploadAvatar(req, res)
);

// ==============================
// C. PLACES (MAPS) ROUTES
// ==============================
// 1. Get All Places (Public)
router.get("/places", (req, res) => PlaceController.getAllPlaces(req, res));

// 2. Contribute Place (Protected & Multipart)
// 'photos' harus sesuai dengan formData.append('photos', ...) di frontend
router.post(
  "/places/contribute",
  authenticateToken,
  upload.array("photos", 5), // Max 5 foto
  (req, res) => PlaceController.contributePlace(req, res)
);

// ==============================
// D. REVIEWS ROUTES
// ==============================
// 1. Get Reviews per Place (Public)
router.get("/reviews/:placeId", ReviewController.getPlaceReviews);

// 2. Post Review (Protected)
router.post(
  "/reviews",
  authenticateToken,
  upload.array("photos", 3), // Max 3 foto
  ReviewController.addReview
);

// ==============================
// E. APP TESTIMONIALS ROUTES
// ==============================
router.post("/app-reviews", optionalAuth, (req, res) =>
  AppReviewController.submitReview(req, res)
);
router.get("/app-reviews/featured", (req, res) =>
  AppReviewController.getFeaturedReviews(req, res)
);

// === USER VISITS ROUTES ===
// 1. Get My Visits (Load saat aplikasi dibuka)
router.get("/user/visits", authenticateToken, (req, res) =>
  UserVisitController.getMyVisits(req, res)
);

// 2. Toggle Visit/Wishlist
router.post("/user/visits", authenticateToken, (req, res) =>
  UserVisitController.toggleVisitStatus(req, res)
);

// ADMIN ROUTER
router.get("/admin/stats", authenticateAdmin, AdminController.getStats);

// Manage Users (INI YANG MENYEBABKAN ERROR 404 ANDA)
router.get("/admin/users", authenticateAdmin, AdminController.getUsers);
router.delete(
  "/admin/users/:id",
  authenticateAdmin,
  AdminController.deleteUser
);
router.put(
  "/admin/users/:id/role",
  authenticateAdmin,
  AdminController.updateUserRole
); // Update Role

// Manage Places
router.put(
  "/admin/places/:id/verify",
  authenticateAdmin,
  AdminController.verifyPlace
);
router.delete(
  "/admin/places/:id",
  authenticateAdmin,
  AdminController.deletePlace
);
router.get("/admin/places", authenticateAdmin, AdminController.getAllPlaces);
// User Contribute

// Admin Create & Update
router.post(
  "/admin/places",
  authenticateAdmin,
  upload.array("photos", 5),
  AdminController.createPlace
);
router.put(
  "/admin/places/:id",
  authenticateAdmin,
  upload.array("photos", 5),
  AdminController.updatePlace
);
// --- MOUNT ROUTER ---
app.use("/api/v1", router);

// --- ERROR HANDLING MIDDLEWARE (Optional but good) ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ message: "File upload error: " + err.message });
  } else if (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  next();
});

// --- 3. SERVER START & DB SYNC ---
const PORT = process.env.PORT || 5000;

sequelize
  // Gunakan { alter: true } agar struktur tabel diperbarui tanpa menghapus data
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database connected & Tables synced");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB Error:", err));

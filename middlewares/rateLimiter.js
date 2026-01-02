const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5x percobaan gagal per IP
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
});

module.exports = authLimiter;

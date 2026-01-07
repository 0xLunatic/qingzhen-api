// src/models/associations.js
const User = require("./User");
const Place = require("./Place");
const Review = require("./Review");
const UserVisit = require("./UserVisit");

// --- RELASI USER & PLACE ---
// User (Contributor) punya banyak Place
User.hasMany(Place, { foreignKey: "contributor_id", as: "places" });
Place.belongsTo(User, { foreignKey: "contributor_id", as: "contributor" });

// --- RELASI PLACE & REVIEW ---
// Place punya banyak Review
Place.hasMany(Review, { foreignKey: "place_id", as: "reviews" });
Review.belongsTo(Place, { foreignKey: "place_id", as: "place" });

// --- RELASI USER & REVIEW ---
// User (Reviewer) punya banyak Review
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

// --- RELASI USER & USER VISIT ---
// User punya banyak daftar kunjungan/wishlist
User.hasMany(UserVisit, { foreignKey: "user_id", as: "visits" });
UserVisit.belongsTo(User, { foreignKey: "user_id", as: "user" });

// --- RELASI PLACE & USER VISIT ---
// Place bisa ada di banyak daftar kunjungan user
Place.hasMany(UserVisit, { foreignKey: "place_id", as: "visits" });
UserVisit.belongsTo(Place, { foreignKey: "place_id", as: "place" });

module.exports = { User, Place, Review, UserVisit };

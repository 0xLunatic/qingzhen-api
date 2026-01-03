// src/models/Review.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // Import model User untuk relasi

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    place_id: {
      // Kita pakai STRING agar fleksibel (bisa simpan ID dari Google Maps/OSM yang panjang)
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID, // Harus sama dengan tipe ID di tabel Users
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photos: {
      type: DataTypes.JSON, // Menyimpan array URL foto: ["url1.jpg", "url2.jpg"]
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false, // Kita tidak butuh updated_at untuk review (opsional)
  }
);

// --- DEFINISI RELASI ---
// Review milik User
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });
// User punya banyak Review
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });

module.exports = Review;

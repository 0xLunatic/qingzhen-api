// src/models/AppReview.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class AppReview extends Model {}

AppReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Boleh null jika guest
      references: {
        model: User,
        key: "id",
      },
    },
    guest_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default tidak tampil di depan sampai admin approve
    },
  },
  {
    sequelize,
    modelName: "AppReview",
    tableName: "app_reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Relasi: Review Aplikasi milik User (opsional)
AppReview.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = AppReview;

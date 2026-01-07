// src/models/UserVisit.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class UserVisit extends Model {}

UserVisit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Visited", "Wishlist"),
      allowNull: false,
      defaultValue: "Visited",
    },
    place_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    visited_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "UserVisit",
    tableName: "user_visits",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ❌ HAPUS RELASI DI SINI JIKA ADA

module.exports = UserVisit;

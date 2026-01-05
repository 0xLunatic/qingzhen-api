// src/models/UserVisit.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Place = require("./Place"); // Pastikan model Place sudah ada

const UserVisit = sequelize.define(
  "UserVisit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Place,
        key: "id",
      },
    },
    visited_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("Visited", "Wishlist"),
      allowNull: false,
    },
  },
  {
    tableName: "user_visits",
    timestamps: false, // Karena sudah ada visited_at
  }
);

// Setup Relasi
User.hasMany(UserVisit, { foreignKey: "user_id" });
UserVisit.belongsTo(User, { foreignKey: "user_id" });

Place.hasMany(UserVisit, { foreignKey: "place_id" });
UserVisit.belongsTo(Place, { foreignKey: "place_id" });

module.exports = UserVisit;

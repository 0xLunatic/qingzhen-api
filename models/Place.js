// src/models/Place.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class Place extends Model {}

Place.init(
  {
    id: {
      type: DataTypes.INTEGER, // Bisa INTEGER auto-increment atau UUID
      autoIncrement: true,
      primaryKey: true,
    },
    name_cn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8), // Presisi tinggi untuk peta
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM("Restaurant", "Mosque", "Market"),
      allowNull: false,
    },
    halal_status: {
      type: DataTypes.ENUM("Verified", "Muslim Owned", "No Pork"),
      defaultValue: "No Pork",
    },
    food_type: {
      type: DataTypes.ENUM("Vegan", "Real Food", "Fast Food"),
      allowNull: true,
    },
    is_promo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    promo_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    opening_hours: {
      type: DataTypes.JSON, // Simpan object: { mon: "09-21", tue: "09-21", ... }
      allowNull: true,
    },
    contributor_id: {
      type: DataTypes.UUID, // Relasi ke User UUID
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default false agar admin cek dulu
    },
  },
  {
    sequelize,
    modelName: "Place",
    tableName: "places",
    timestamps: true, // created_at, updated_at
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Relasi
Place.belongsTo(User, { foreignKey: "contributor_id", as: "contributor" });

module.exports = Place;

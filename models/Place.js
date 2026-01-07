// src/models/Place.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// ❌ HAPUS IMPORT MODEL LAIN (User, Review) DISINI
// const User = require("./User"); <--- HAPUS INI
// const Review = require("./Review"); <--- HAPUS INI

class Place extends Model {}

Place.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_en: { type: DataTypes.STRING, allowNull: false },
    name_cn: { type: DataTypes.STRING, allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: true },
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
    is_promo: { type: DataTypes.BOOLEAN, defaultValue: false },
    promo_details: { type: DataTypes.TEXT, allowNull: true },
    opening_hours: { type: DataTypes.JSON, allowNull: true },
    contributor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    image_url: { type: DataTypes.STRING, allowNull: true },
    photos: { type: DataTypes.JSON, allowNull: true },
    osm_id: { type: DataTypes.STRING, allowNull: true, unique: true },
  },
  {
    sequelize,
    modelName: "Place",
    tableName: "places",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ❌ HAPUS SEMUA RELASI DI BAWAH INI (KARENA SUDAH ADA DI associations.js)
// Place.belongsTo(...)
// Place.hasMany(...)

module.exports = Place;

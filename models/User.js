// src/models/User.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // 👇 TAMBAHAN BARU: NAMA ASLI
    name: {
      type: DataTypes.STRING,
      allowNull: true, // Opsional, bisa diisi nanti di profil
      validate: {
        len: [2, 100], // Minimal 2 karakter
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: "unique_username_constraint", // ✅ BERI NAMA KHUSUS
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: "unique_email_constraint", // ✅ BERI NAMA KHUSUS
      validate: { isEmail: true },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "unique_phone_constraint", // ✅ BERI NAMA KHUSUS
      validate: {
        is: /^(\+86|\+62)[0-9]{9,13}$/,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wechat_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: "unique_wechat_constraint", // ✅ BERI NAMA KHUSUS
    },
    apple_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: "unique_apple_constraint", // ✅ BERI NAMA KHUSUS
    },
    // --- PROFIL & GAMIFIKASI ---
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.STRING,
      defaultValue: "I love halal food!",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    badges: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    role: {
      type: DataTypes.ENUM("user", "contributor", "admin"),
      defaultValue: "user",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updated_at: "updated_at",
  }
);

module.exports = User;

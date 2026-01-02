// src/controllers/AuthController.js
const AuthService = require("../services/AuthService");

class AuthController {
  // Register
  async register(req, res) {
    try {
      const result = await AuthService.registerUser(req.body);
      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Login (Password)
  async login(req, res) {
    try {
      const { identifier, password } = req.body; // Identifier bisa HP/Email/Username
      const result = await AuthService.loginUser(identifier, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  // Login (Social) - Mockup untuk backend logic
  async socialLogin(req, res) {
    try {
      const { provider, social_id, phone } = req.body; // provider: 'wechat' | 'apple'
      const result = await AuthService.loginWithSocial(
        provider,
        social_id,
        phone
      );

      res.status(200).json({
        success: true,
        message: `${provider} login successful`,
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();

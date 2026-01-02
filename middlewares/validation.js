// src/middlewares/validation.js
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(), // 👈 Tambahkan ini
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().optional(),
  phone_number: Joi.string()
    .pattern(/^(\+86|\+62)[0-9]{9,13}$/)
    .required(),
  password: Joi.string().min(8).required(),
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

module.exports = { validateRegister };

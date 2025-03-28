const express = require("express");
const { loginUser, registerUser, forgotPassword } = require("../controllers/authController");

const router = express.Router();

// Đăng nhập
router.post("/login", loginUser);

// Đăng ký
router.post("/register", registerUser);

// Quên mật khẩu
router.post("/forgot-password", forgotPassword);

module.exports = router;

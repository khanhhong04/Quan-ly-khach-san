const express = require("express");
const { loginUser, registerUser, forgotPassword, verifyToken } = require("../controllers/authController");

const router = express.Router();

// Đăng nhập
router.post("/login", loginUser);

// Đăng ký
router.post("/register",  registerUser);

// Quên mật khẩu
router.post("/forgot-password", forgotPassword);

// Xác minh token
router.get("/verify-token", verifyToken);

module.exports = router;

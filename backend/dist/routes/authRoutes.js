const express = require("express");
const { loginUser, registerUser, forgotPassword, verifyOTPAndResetPassword, verifyToken } = require("../controllers/authController");

const router = express.Router();

// Đăng nhập
router.post("/login", loginUser);

// Đăng ký
router.post("/register", registerUser);

// Quên mật khẩu - Gửi mã OTP
router.post("/forgot-password", forgotPassword);

// Xác minh OTP và đặt lại mật khẩu
router.post("/verify-otp", verifyOTPAndResetPassword);

// Xác minh token
router.get("/verify-token", verifyToken);

module.exports = router;
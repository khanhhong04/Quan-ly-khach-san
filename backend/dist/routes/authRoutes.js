const express = require("express");
const { loginUser, registerUser, forgotPassword, verifyOTPAndResetPassword, verifyToken, getTotalUsers } = require("../controllers/authController");

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

// Lấy tổng số tài khoản
router.get("/total-users", getTotalUsers);

module.exports = router;
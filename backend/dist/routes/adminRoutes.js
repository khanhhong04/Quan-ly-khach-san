const express = require("express");
const { adminLogin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware kiểm tra vai trò admin
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 3) {
        return res.status(403).json({ success: false, message: "Truy cập bị từ chối! Bạn không phải admin." });
    }
    next();
};

// Đăng nhập admin
router.post("/login", adminLogin);

// Route mẫu chỉ dành cho admin (ví dụ: lấy thông tin hệ thống)
router.get("/dashboard", authMiddleware, adminMiddleware, (req, res) => {
    res.json({ success: true, message: "Chào mừng đến với dashboard admin!" });
});

module.exports = router;
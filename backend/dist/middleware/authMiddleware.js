const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();

// Sử dụng middleware để phân tích JSON body
app.use(express.json());

// Cấu hình CORS
app.use(cors({
    origin: "*",  // Địa chỉ của frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware kiểm tra token
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ success: false, message: "Truy cập bị từ chối! Không có token." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Token không hợp lệ!" });
    }
};
module.exports = authMiddleware;
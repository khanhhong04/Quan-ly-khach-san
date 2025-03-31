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

// Route xác minh token
app.post('/api/auth/verify-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token không được cung cấp.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
        }

        res.json({ success: true, message: 'Token hợp lệ', decoded });
    });
});

module.exports = authMiddleware;
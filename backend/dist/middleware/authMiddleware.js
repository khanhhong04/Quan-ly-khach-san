const jwt = require("jsonwebtoken");
require("dotenv").config();

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
app.use(cors({
    origin: "http://localhost:3000",  // Địa chỉ của frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

module.exports = authMiddleware;
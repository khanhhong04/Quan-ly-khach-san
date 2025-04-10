const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');

// Debug: Kiểm tra kiểu dữ liệu của routes

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Phục vụ file tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);


// Khởi động server
const PORT = process.env.PORT || 3001;
app.listen(PORT,'0.0.0.0',  () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});

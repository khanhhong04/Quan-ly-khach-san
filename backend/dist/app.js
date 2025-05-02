const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
const { setupCronJobs } = require('./cron'); // Import cron job setup
const chatbotRoutes = require("./routes/chatbotRoutes");



// Debug: Kiểm tra kiểu dữ liệu của routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // Thêm route mới
const adminRoutes = require("./routes/adminRoutes");

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
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/payments", paymentRoutes); // Thêm route
app.use("/api/admin", adminRoutes);


// Khởi động cron jobs
setupCronJobs();


// Khởi động server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
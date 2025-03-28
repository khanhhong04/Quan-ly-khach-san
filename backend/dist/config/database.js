const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ file .env

// Tạo pool kết nối giúp tối ưu hiệu suất
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "2004",  
    database: process.env.DB_NAME || "demo",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Connected to MySQL database");
        connection.release();
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
})();

module.exports = pool;

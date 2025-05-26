const db = require("../config/database");

const getUsers = async (req, res) => {
    try {
        const [results] = await db.execute("SELECT COUNT(*) as totalUsers FROM User"); // Đếm tổng số tài khoản
        res.json({ khachDangKy: results[0].totalUsers }); // Trả về dưới dạng { "khachDangKy": số_lượng }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getUsers };
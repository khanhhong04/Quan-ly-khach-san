const db = require("../config/db");

const getUsers = (req, res) => {
    db.query("SELECT * FROM user", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// Thêm chức năng đăng nhập
const loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin!" });
    }

    // Sử dụng tên cột đúng trong database
    const query = "SELECT * FROM user WHERE TaiKhoan = ? AND MatKhau = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        if (results.length > 0) {
            return res.json({ success: true, message: "Đăng nhập thành công!", user: results[0] });
        } else {
            return res.status(401).json({ success: false, message: "Sai thông tin đăng nhập!" });
        }
    });
};

// Export để sử dụng trong `userRoutes.js`
module.exports = { getUsers, loginUser };

const db = require("../config/database");
const bcrypt = require('bcrypt'); // Thêm bcrypt để so sánh mật khẩu

const getUsers = async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM User");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin!" });
    }

    try {
        // Tìm tài khoản theo TaiKhoan
        const [results] = await db.execute("SELECT * FROM User WHERE TaiKhoan = ?", [username]);
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Tài khoản không tồn tại!" });
        }

        // Lấy thông tin tài khoản
        const user = results[0];

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.MatKhau);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Mật khẩu không đúng!" });
        }

        // Đăng nhập thành công
        return res.json({ success: true, message: "Đăng nhập thành công!", user: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getUsers, loginUser };
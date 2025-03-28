const db = require("../config/database");

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
        const [results] = await db.execute("SELECT * FROM User WHERE TaiKhoan = ? AND MatKhau = ?", [username, password]);
        if (results.length > 0) {
            return res.json({ success: true, message: "Đăng nhập thành công!", user: results[0] });
        } else {
            return res.status(401).json({ success: false, message: "Sai thông tin đăng nhập!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getUsers, loginUser };

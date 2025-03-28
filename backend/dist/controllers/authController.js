const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Đăng nhập
const loginUser = (req, res) => {
    const { TaiKhoan, MatKhau } = req.body;
    if (!TaiKhoan || !MatKhau) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    db.query("SELECT * FROM User WHERE TaiKhoan = ?", [TaiKhoan], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi truy vấn cơ sở dữ liệu!", error: err });
        if (results.length === 0) return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });

        const user = results[0];
        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
        }

        const token = jwt.sign({ id: user.ID, role: user.RoleID }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({
            success: true,
            message: "Đăng nhập thành công!",
            token,
            user: { ID: user.ID, HoTen: user.HoTen, Email: user.Email, SoDienThoai: user.SoDienThoai, TaiKhoan: user.TaiKhoan, RoleID: user.RoleID },
        });
    });
};

// Đăng ký tài khoản
const registerUser = async (req, res) => {
    try {
        const { HoTen, Email, SoDienThoai, TaiKhoan, MatKhau } = req.body;
        if (!HoTen || !Email || !SoDienThoai || !TaiKhoan || !MatKhau) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        db.query("SELECT * FROM User WHERE TaiKhoan = ?", [TaiKhoan], async (err, results) => {
            if (err) return res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu!", error: err });
            if (results.length > 0) return res.status(400).json({ message: "Tài khoản đã tồn tại!" });

            const hashedPassword = await bcrypt.hash(MatKhau, 10);
            db.query("INSERT INTO User (HoTen, Email, SoDienThoai, TaiKhoan, MatKhau, RoleID) VALUES (?, ?, ?, ?, ?, ?)",
                [HoTen, Email, SoDienThoai, TaiKhoan, hashedPassword, 2],
                (err) => {
                    if (err) return res.status(500).json({ message: "Lỗi khi đăng ký người dùng!", error: err });
                    res.status(201).json({ message: "Đăng ký thành công!" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Quên mật khẩu (chưa triển khai)
const forgotPassword = (req, res) => {
    res.status(501).json({ message: "Chức năng quên mật khẩu chưa được triển khai!" });
};

// Export các hàm
module.exports = { loginUser, registerUser, forgotPassword };

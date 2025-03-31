const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Đăng nhập
const loginUser = async (req, res) => {
    try {
        const { TaiKhoan, MatKhau } = req.body;
        if (!TaiKhoan || !MatKhau) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const [results] = await db.execute("SELECT * FROM User WHERE TaiKhoan = ?", [TaiKhoan]);
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
        }

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
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};

// Đăng ký tài khoản
const registerUser = async (req, res) => {
    try {
        const { HoTen, Email, SoDienThoai, TaiKhoan, MatKhau } = req.body;
        if (!HoTen || !Email || !SoDienThoai || !TaiKhoan || !MatKhau) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const [results] = await db.execute("SELECT * FROM User WHERE TaiKhoan = ?", [TaiKhoan]);
        if (results.length > 0) {
            return res.status(400).json({ message: "Tài khoản đã tồn tại!" });
        }

        const hashedPassword = await bcrypt.hash(MatKhau, 10);
        await db.execute("INSERT INTO User (HoTen, Email, SoDienThoai, TaiKhoan, MatKhau, RoleID) VALUES (?, ?, ?, ?, ?, ?)", 
            [HoTen, Email, SoDienThoai, TaiKhoan, hashedPassword, 1]
        );

        return res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Quên mật khẩu - Gửi email đặt lại mật khẩu
const forgotPassword = async (req, res) => {
    try {
        const { Email } = req.body;
        if (!Email) return res.status(400).json({ message: "Vui lòng nhập email!" });

        const [results] = await db.execute("SELECT * FROM User WHERE Email = ?", [Email]);
        if (results.length === 0) return res.status(404).json({ message: "Email không tồn tại!" });

        const user = results[0];
        const resetToken = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.Email,
            subject: "Đặt lại mật khẩu",
            text: `Nhấn vào link sau để đặt lại mật khẩu: ${resetLink}`
        });

        res.json({ message: "Email đặt lại mật khẩu đã được gửi!" });
    } catch (error) {
        console.error("❌ Lỗi quên mật khẩu:", error);
        res.status(500).json({ message: "Lỗi khi gửi email!", error: error.message });
    }
    
};

// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: "Thiếu dữ liệu!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute("UPDATE User SET MatKhau = ? WHERE ID = ?", [hashedPassword, userId]);

        res.json({ message: "Mật khẩu đã được cập nhật!" });
    } catch (error) {
        res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

// Export các hàm
module.exports = { loginUser, registerUser, forgotPassword, resetPassword };

const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
    console.log("📢 Received request to register:", req.body);
    try {
        const { HoTen, Email, SoDienThoai, TaiKhoan, MatKhau } = req.body;
        if (!HoTen || !Email || !SoDienThoai || !TaiKhoan || !MatKhau) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        // Kiểm tra tài khoản đã tồn tại chưa
        const [results] = await db.query("SELECT * FROM User WHERE TaiKhoan = ?", [TaiKhoan]);
        if (results.length > 0) {
            return res.status(400).json({ message: "Tài khoản đã tồn tại!" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(MatKhau, 10);
        
        // Chèn dữ liệu vào database
        await db.query(
            "INSERT INTO User (HoTen, Email, SoDienThoai, TaiKhoan, MatKhau, RoleID) VALUES (?, ?, ?, ?, ?, ?)",
            [HoTen, Email, SoDienThoai, TaiKhoan, hashedPassword, 2]
        );
        return res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("❌ Lỗi server:", error);
        return res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


// Cấu hình dịch vụ email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Quên mật khẩu - Gửi email chứa link đặt lại mật khẩu
const forgotPassword = async (req, res) => {
    const { Email } = req.body;
    if (!Email) return res.status(400).json({ message: "Vui lòng nhập email!" });

    try {
        const [results] = await db.query("SELECT * FROM User WHERE Email = ?", [Email]);
        if (results.length === 0) return res.status(404).json({ message: "Email không tồn tại!" });

        const user = results[0];

        // Tạo token đặt lại mật khẩu (hết hạn sau 15 phút)
        const resetToken = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, { expiresIn: "15m" });

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.Email,
            subject: "Đặt lại mật khẩu",
            text: `Nhấn vào link sau để đặt lại mật khẩu: ${resetLink}`
        };

        await transporter.sendMail(mailOptions);  // Sử dụng await để đảm bảo gửi email xong
        res.json({ message: "Email đặt lại mật khẩu đã được gửi!" });
    } catch (error) {
        console.error("❌ Lỗi khi gửi email:", error);
        res.status(500).json({ message: "Lỗi khi gửi email!" });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Thiếu dữ liệu!" });

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới vào database
        db.query("UPDATE User SET MatKhau = ? WHERE ID = ?", [hashedPassword, userId], (err) => {
            if (err) return res.status(500).json({ message: "Lỗi khi cập nhật mật khẩu!" });
            res.json({ message: "Mật khẩu đã được cập nhật!" });
        });
    } catch (error) {
        res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};


// Export các hàm
module.exports = { loginUser, registerUser, forgotPassword };

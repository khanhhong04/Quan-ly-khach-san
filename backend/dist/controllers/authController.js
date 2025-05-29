const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sendOTPEmail } = require("../utils/sendEmail");

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

// Quên mật khẩu - Gửi mã OTP qua email
const forgotPassword = async (req, res) => {
    try {
        const { Email } = req.body;
        if (!Email) return res.status(400).json({ message: "Vui lòng nhập email!" });

        const [results] = await db.execute("SELECT * FROM User WHERE Email = ?", [Email]);
        if (results.length === 0) return res.status(404).json({ message: "Email không tồn tại!" });

        // Tạo mã OTP ngẫu nhiên 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

        // Lưu OTP vào bảng otp_codes
        await db.execute(
            "INSERT INTO otp_codes (Email, OTP, ExpiresAt) VALUES (?, ?, ?)",
            [Email, otp, expiresAt]
        );

        // Gửi email chứa mã OTP
        await sendOTPEmail(Email, otp);

        res.json({ message: "Mã OTP đã được gửi đến email của bạn!" });
    } catch (error) {
        console.error("❌ Lỗi gửi mã OTP:", error);
        res.status(500).json({ message: "Lỗi khi gửi mã OTP!", error: error.message });
    }
};

// Xác minh OTP và đặt lại mật khẩu
const verifyOTPAndResetPassword = async (req, res) => {
    try {
        const { Email, otp, newPassword } = req.body;
        if (!Email || !otp || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập email, mã OTP và mật khẩu mới!" });
        }

        // Kiểm tra mã OTP
        const [results] = await db.execute(
            "SELECT * FROM otp_codes WHERE Email = ? AND OTP = ?",
            [Email, otp]
        );
        if (results.length === 0) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ!" });
        }

        const otpRecord = results[0];
        const now = new Date();
        if (now > new Date(otpRecord.ExpiresAt)) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
        }

        // Tìm người dùng
        const [userResults] = await db.execute("SELECT * FROM User WHERE Email = ?", [Email]);
        if (userResults.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại!" });
        }

        // Đặt lại mật khẩu
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute("UPDATE User SET MatKhau = ? WHERE Email = ?", [hashedPassword, Email]);

        // Xóa mã OTP sau khi sử dụng
        await db.execute("DELETE FROM otp_codes WHERE Email = ? AND OTP = ?", [Email, otp]);

        res.json({ message: "Mật khẩu đã được cập nhật thành công!" });
    } catch (error) {
        console.error("❌ Lỗi xác minh OTP và đặt lại mật khẩu:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Xác minh token
const verifyToken = async (req, res) => {
    const token = req.header("Authorization");
    console.log("Verify-token - Token nhận được:", token);
    if (!token) {
      return res.status(401).json({ success: false, message: "Không có token" });
    }
  
    try {
      let cleanToken = token;
      if (token.startsWith("Bearer ")) {
        cleanToken = token.replace("Bearer ", "");
      }
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      console.log("Verify-token - Decoded:", decoded);
      res.json({ success: true, message: "Token hợp lệ", decoded });
    } catch (err) {
      console.error("Verify-token - Lỗi:", err.message);
      res.status(401).json({ success: false, message: `Token không hợp lệ: ${err.message}` });
    }
};

// Đăng nhập admin
const adminLogin = async (req, res) => {
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
        if (user.RoleID !== 3) {
            return res.status(403).json({ success: false, message: "Truy cập bị từ chối! Tài khoản này không phải admin." });
        }

        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
        }

        

      // Thêm isAdmin vào token dựa trên RoleID
        const token = jwt.sign(
            { id: user.ID, role: user.RoleID, isAdmin: user.RoleID === 3 },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({
            success: true,
            message: "Đăng nhập admin thành công!",
            token,
            user: { ID: user.ID, HoTen: user.HoTen, Email: user.Email, SoDienThoai: user.SoDienThoai, TaiKhoan: user.TaiKhoan, RoleID: user.RoleID },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};

// Lấy tổng số tài khoản
const getTotalUsers = async (req, res) => {
    try {
        const [results] = await db.execute("SELECT COUNT(*) as totalUsers FROM user");
        res.json({ khachDangKy: results[0].totalUsers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Trong authController.js, thêm hàm mới
const getAllUsers = async (req, res) => {
  try {
    const db = require("../config/database");
    const [results] = await db.execute("SELECT ID, HoTen, Email, SoDienThoai, TaiKhoan, RoleID FROM User");
    res.status(200).json({ users: results });
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Error fetching all users', error: err.message });
  }
};

module.exports = { loginUser, registerUser, forgotPassword, verifyOTPAndResetPassword, verifyToken, adminLogin, getTotalUsers, getAllUsers };
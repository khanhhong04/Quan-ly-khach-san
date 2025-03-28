const express = require("express");
const { getUsers, loginUser } = require("../controllers/userController");

const router = express.Router();

// Route lấy danh sách người dùng
router.get("/", getUsers);

// Route đăng nhập (Sửa lỗi 404)
router.post("/login", loginUser);

module.exports = router;


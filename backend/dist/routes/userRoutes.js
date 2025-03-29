const express = require("express");
const { getUsers } = require("../controllers/userController");  // Kiểm tra đường dẫn

const router = express.Router();

router.get("/users", getUsers);  // Đảm bảo `getUsers` đã được import

module.exports = router;

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Định tuyến API
router.post('/', roomController.getAvailableRooms);
// Định tuyến để lấy thống kê phòng
router.get('/stats', roomController.getRoomStats);
router.get('/:id', roomController.getRoomById); // Thêm route để lấy chi tiết phòng
module.exports = router;
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Định tuyến API
router.post('/', roomController.getAvailableRooms);
router.get('/:id', roomController.getRoomById); // Thêm route để lấy chi tiết phòng

module.exports = router;
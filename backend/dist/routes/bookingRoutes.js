const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Định tuyến API
router.post('/', bookingController.createBooking); // Tạo đặt phòng mới
router.patch('/:id/cancel', bookingController.cancelBooking); // Hủy đặt phòng

module.exports = router;
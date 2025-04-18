const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require("../middleware/authMiddleware");

router.post('/', authMiddleware, bookingController.createBooking);
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.get('/', authMiddleware, bookingController.getBookings); // Thêm endpoint GET
module.exports = router;
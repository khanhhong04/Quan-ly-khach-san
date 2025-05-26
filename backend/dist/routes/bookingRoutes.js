const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require("../middleware/authMiddleware");
const { getBookedRooms } = require("../controllers/bookingController");

router.post('/', authMiddleware, bookingController.createBooking);
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.get('/', authMiddleware, bookingController.getBookings); // Thêm endpoint GET
// Định tuyến để lấy số lượng phòng đã đặt
router.get('/stats/booked', bookingController.getBookedRoomsCount);

// Định tuyến để lấy số lượng phòng đã hủy
router.get('/stats/cancelled', bookingController.getCancelledRoomsCount);
// Lấy danh sách phòng đã đặt (trạng thái DA_THUE)
router.get("/booked-rooms", getBookedRooms);
// Lấy danh sách phòng đã thanh toán (trạng thái DA_THANH_TOAN)
router.get("/paid-bookings", bookingController.getPaidBookings);
// Lấy tất cả danh sách đặt phòng
router.get("/all", authMiddleware, bookingController.getAllBookings);

module.exports = router;
const dbPromise = require('../config/database');

// Tạo đặt phòng mới
const createBooking = async (req, res) => {
  const { MaKH, NgayDat, NgayNhan, NgayTra, MaPhong, GhiChu } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!MaKH || !NgayDat || !NgayNhan || !NgayTra || !MaPhong) {
    return res.status(400).json({ message: 'MaKH, NgayDat, NgayNhan, NgayTra, and MaPhong are required' });
  }

  // Kiểm tra định dạng ngày
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormat.test(NgayDat) || !dateFormat.test(NgayNhan) || !dateFormat.test(NgayTra)) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Kiểm tra NgayTra phải sau NgayNhan
  if (new Date(NgayTra) <= new Date(NgayNhan)) {
    return res.status(400).json({ message: 'Check-out date must be after check-in date' });
  }

  try {
    const db = await dbPromise;

    // Kiểm tra xem phòng có trống trong khoảng thời gian yêu cầu không
    const checkAvailabilityQuery = `
      SELECT MaPhong
      FROM datphong
      WHERE MaPhong = ?
      AND (
        (NgayNhan <= ? AND NgayTra >= ?)
        OR (NgayNhan <= ? AND NgayTra >= ?)
        OR (NgayNhan >= ? AND NgayTra <= ?)
      )
      AND TrangThai IN ('DA_THUE', 'DANG_SU_DUNG');
    `;
    const [existingBookings] = await db.query(checkAvailabilityQuery, [
      MaPhong,
      NgayTra,
      NgayNhan,
      NgayTra,
      NgayNhan,
      NgayNhan,
      NgayTra,
    ]);

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: 'Room is already booked for the selected dates' });
    }

    // Kiểm tra xem phòng có tồn tại không
    const checkRoomQuery = `
      SELECT MaPhong
      FROM phong
      WHERE MaPhong = ?;
    `;
    const [room] = await db.query(checkRoomQuery, [MaPhong]);

    if (room.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Thêm bản ghi vào bảng datphong với trạng thái DA_THUE
    const insertBookingQuery = `
      INSERT INTO datphong (MaKH, NgayDat, NgayNhan, NgayTra, TrangThai, GhiChu, MaPhong)
      VALUES (?, ?, ?, ?, 'DA_THUE', ?, ?);
    `;
    const [result] = await db.query(insertBookingQuery, [MaKH, NgayDat, NgayNhan, NgayTra, GhiChu || null, MaPhong]);

    res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertId });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Error creating booking', error: err.message });
  }
};

// Hủy đặt phòng
const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;

    // Kiểm tra xem đặt phòng có tồn tại không
    const checkBookingQuery = `
      SELECT MaPhong, TrangThai
      FROM datphong
      WHERE MaDatPhong = ?;
    `;
    const [booking] = await db.query(checkBookingQuery, [id]);

    if (booking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking[0].TrangThai === 'DA_HUY') {
      return res.status(400).json({ message: 'Booking is already canceled' });
    }

    // Cập nhật trạng thái đặt phòng thành DA_HUY
    const updateBookingQuery = `
      UPDATE datphong
      SET TrangThai = 'DA_HUY'
      WHERE MaDatPhong = ?;
    `;
    await db.query(updateBookingQuery, [id]);

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (err) {
    console.error('Error canceling booking:', err);
    res.status(500).json({ message: 'Error canceling booking', error: err.message });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
};
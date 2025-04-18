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

    // Kiểm tra xem phòng có tồn tại và trạng thái phòng
    const checkRoomQuery = `
      SELECT MaPhong, TrangThai
      FROM phong
      WHERE MaPhong = ?;
    `;
    const [room] = await db.query(checkRoomQuery, [MaPhong]);

    if (room.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room[0].TrangThai !== 'TRONG') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Thêm bản ghi vào bảng datphong với trạng thái DA_THUE
    const insertBookingQuery = `
      INSERT INTO datphong (MaKH, NgayDat, NgayNhan, NgayTra, TrangThai, GhiChu, MaPhong)
      VALUES (?, ?, ?, ?, 'DA_THUE', ?, ?);
    `;
    const [result] = await db.query(insertBookingQuery, [
      MaKH,
      NgayDat,
      NgayNhan,
      NgayTra,
      GhiChu || null,
      MaPhong,
    ]);

    // Cập nhật trạng thái phòng thành DA_THUE
    const updateRoomQuery = `
      UPDATE phong
      SET TrangThai = 'DA_THUE'
      WHERE MaPhong = ?;
    `;
    await db.query(updateRoomQuery, [MaPhong]);

    res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertId });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Error creating booking', error: err.message });
  }
};

// Hủy đặt phòng
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const db = await dbPromise;
    const checkBookingQuery = `
      SELECT MaPhong, TrangThai, MaKH
      FROM datphong
      WHERE MaDatPhong = ?;
    `;
    const [booking] = await db.query(checkBookingQuery, [id]);

    if (booking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking[0].MaKH !== user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đặt phòng này' });
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

    // Kiểm tra xem phòng có đặt phòng nào khác không
    const checkOtherBookingsQuery = `
      SELECT 1
      FROM datphong
      WHERE MaPhong = ?
      AND MaDatPhong != ?
      AND TrangThai IN ('DA_THUE', 'DANG_SU_DUNG');
    `;
    const [otherBookings] = await db.query(checkOtherBookingsQuery, [booking[0].MaPhong, id]);

    if (otherBookings.length === 0) {
      const updateRoomQuery = `
        UPDATE phong
        SET TrangThai = 'TRONG'
        WHERE MaPhong = ?;
      `;
      await db.query(updateRoomQuery, [booking[0].MaPhong]);
    }

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (err) {
    console.error('Error canceling booking:', err);
    res.status(500).json({ message: 'Error canceling booking', error: err.message });
  }
};

// Lấy danh sách đặt phòng của người dùng
const getBookings = async (req, res) => {
  const user = req.user;

  try {
    const db = await dbPromise;
    const query = `
      SELECT dp.MaDatPhong, dp.MaKH, dp.NgayDat, dp.NgayNhan, dp.NgayTra, 
             dp.MaPhong, dp.TrangThai, dp.GhiChu
      FROM datphong dp
      LEFT JOIN phong p ON dp.MaPhong = p.MaPhong
      WHERE dp.MaKH = ?;
    `;
    const [bookings] = await db.query(query, [user.id]);

    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
};

// Cập nhật trạng thái đặt phòng theo ngày
const updateBookingStatus = async () => {
  try {
    const db = await dbPromise;
    const today = new Date().toISOString().split('T')[0];

    // Cập nhật trạng thái DANG_SU_DUNG khi đến ngày nhận
    const updateCheckInQuery = `
      UPDATE datphong
      SET TrangThai = 'DANG_SU_DUNG'
      WHERE NgayNhan = ? AND TrangThai = 'DA_THUE';
    `;
    await db.query(updateCheckInQuery, [today]);

    // Cập nhật trạng thái phòng thành DANG_SU_DUNG khi đến ngày nhận
    const updateRoomCheckInQuery = `
      UPDATE phong p
      SET TrangThai = 'DANG_SU_DUNG'
      WHERE EXISTS (
        SELECT 1
        FROM datphong dp
        WHERE dp.MaPhong = p.MaPhong
        AND dp.NgayNhan = ?
        AND dp.TrangThai = 'DANG_SU_DUNG'
      );
    `;
    await db.query(updateRoomCheckInQuery, [today]);

    // Cập nhật trạng thái TRONG khi hết ngày trả
    const updateCheckOutQuery = `
      UPDATE datphong
      SET TrangThai = 'TRONG'
      WHERE NgayTra < ? AND TrangThai IN ('DA_THUE', 'DANG_SU_DUNG');
    `;
    await db.query(updateCheckOutQuery, [today]);

    // Cập nhật trạng thái phòng thành TRONG
    const updateRoomCheckOutQuery = `
      UPDATE phong p
      SET TrangThai = 'TRONG'
      WHERE EXISTS (
        SELECT 1
        FROM datphong dp
        WHERE dp.MaPhong = p.MaPhong
        AND dp.NgayTra < ?
        AND dp.TrangThai = 'TRONG'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM datphong dp2
        WHERE dp2.MaPhong = p.MaPhong
        AND dp2.TrangThai IN ('DA_THUE', 'DANG_SU_DUNG')
      );
    `;
    await db.query(updateRoomCheckOutQuery, [today]);

    console.log('Updated booking and room statuses');
  } catch (err) {
    console.error('Error updating booking statuses:', err);
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getBookings,
  updateBookingStatus,
};
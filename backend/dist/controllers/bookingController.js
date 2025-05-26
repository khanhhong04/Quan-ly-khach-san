const dbPromise = require('../config/database');
const { sendBookingConfirmation, sendCancellationConfirmation } = require('../utils/sendEmail');

// Hàm định dạng ngày tháng theo múi giờ địa phương (GMT+7)
const formatDateLocal = (date) => {
  const offset = 7 * 60; // GMT+7 (7 giờ = 420 phút)
  const localDate = new Date(date.getTime() + (offset * 60 * 1000));
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const year = localDate.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

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

    // Truy vấn email khách hàng từ bảng khachhang
    const getCustomerQuery = `
      SELECT Email
      FROM user
      WHERE ID = ?;
    `;
    const [customer] = await db.query(getCustomerQuery, [MaKH]);

    if (customer.length === 0 || !customer[0].Email) {
      return res.status(404).json({ message: 'Customer email not found' });
    }

    const customerEmail = customer[0].Email;

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

    // Gửi email xác nhận đặt phòng
    const bookingDetails = {
      bookingId: result.insertId,
      checkInDate: NgayNhan,
      checkOutDate: NgayTra,
      roomId: MaPhong,
    };
    await sendBookingConfirmation(customerEmail, bookingDetails);

    res.status(201).json({ message: 'Booking created successfully, confirmation email sent', bookingId: result.insertId });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Error creating booking or sending email', error: err.message });
  }
};

// Hủy đặt phòng
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const db = await dbPromise;
    // Lấy thông tin đặt phòng và email khách hàng
    const checkBookingQuery = `
      SELECT dp.MaPhong, dp.TrangThai, dp.MaKH, dp.NgayNhan, dp.NgayTra, u.Email
      FROM datphong dp
      JOIN user u ON dp.MaKH = u.ID
      WHERE dp.MaDatPhong = ?;
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

    // Kiểm tra nếu đã thanh toán (DA_THANH_TOAN), không cho hủy
    if (booking[0].TrangThai === 'DA_THANH_TOAN') {
      return res.status(400).json({ message: 'Không thể hủy đặt phòng đã thanh toán' });
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

    // Gửi email thông báo hủy phòng
    const cancellationDetails = {
      bookingId: id,
      checkInDate: booking[0].NgayNhan,
      checkOutDate: booking[0].NgayTra,
      roomId: booking[0].MaPhong,
    };
    await sendCancellationConfirmation(booking[0].Email, cancellationDetails);

    res.status(200).json({ message: 'Booking canceled successfully, cancellation email sent' });
  } catch (err) {
    console.error('Error canceling booking:', err);
    res.status(500).json({ message: 'Error canceling booking or sending email', error: err.message });
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

// Lấy số lượng phòng đã đặt (DA_THUE, DANG_SU_DUNG, DA_THANH_TOAN)
const getBookedRoomsCount = async (req, res) => {
  try {
    const db = await dbPromise;

    const query = `
      SELECT COUNT(DISTINCT MaPhong) as phongDaDat
      FROM datphong
      WHERE TrangThai IN ('DA_THUE', 'DANG_SU_DUNG', 'DA_THANH_TOAN');
    `;
    const [result] = await db.query(query);

    res.status(200).json({
      phongDaDat: result[0].phongDaDat || 0,
    });
  } catch (err) {
    console.error('Error fetching booked rooms count:', err);
    res.status(500).json({ message: 'Error fetching booked rooms count', error: err.message });
  }
};

// Lấy tổng số bản ghi có trạng thái DA_HUY (tổng số lượt đặt phòng bị hủy)
const getCancelledRoomsCount = async (req, res) => {
  try {
    const db = await dbPromise;

    const query = `
      SELECT COUNT(*) as phongDaHuy
      FROM datphong
      WHERE TrangThai = 'DA_HUY';
    `;
    const [result] = await db.query(query);

    res.status(200).json({
      phongDaHuy: result[0].phongDaHuy || 0,
    });
  } catch (err) {
    console.error('Error fetching cancelled rooms count:', err);
    res.status(500).json({ message: 'Error fetching cancelled rooms count', error: err.message });
  }
};

// Lấy danh sách phòng đã đặt (trạng thái DA_THUE)
const getBookedRooms = async (req, res) => {
  try {
    const db = await dbPromise;

    const query = `
      SELECT 
        dp.MaDatPhong,
        u.HoTen AS ten,
        u.SoDienThoai AS sdt,
        p.TenLoaiPhong AS phong,
        p.GiaPhong AS gia,
        dp.NgayNhan AS ngayVao,
        dp.NgayTra AS ngayTra,
        dp.NgayDat AS ngayDat,
        DATEDIFF(dp.NgayTra, CURDATE()) AS thoiGianConLai
      FROM datphong dp
      JOIN user u ON dp.MaKH = u.ID
      JOIN phong p ON dp.MaPhong = p.MaPhong
      WHERE dp.TrangThai = 'DA_THUE';
    `;
    const [bookings] = await db.query(query);

    // Định dạng thời gian còn lại
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      thoiGianConLai: booking.thoiGianConLai > 0 ? `${booking.thoiGianConLai} ngày` : '0 ngày',
      gia: booking.gia,
      datPhongId: booking.MaDatPhong,
      ngayVao: formatDateLocal(booking.ngayVao),
      ngayTra: formatDateLocal(booking.ngayTra),
      ngayDat: formatDateLocal(booking.ngayDat),
    }));

    res.status(200).json({ bookings: formattedBookings });
  } catch (err) {
    console.error('Error fetching booked rooms:', err);
    res.status(500).json({ message: 'Error fetching booked rooms', error: err.message });
  }
};

// Lấy danh sách phòng đã thanh toán (trạng thái DA_THANH_TOAN)
const getPaidBookings = async (req, res) => {
  try {
    const db = await dbPromise;

    const query = `
      SELECT 
        dp.MaDatPhong,
        u.HoTen AS ten,
        u.SoDienThoai AS sdt,
        p.TenLoaiPhong AS phong,
        p.GiaPhong AS gia,
        dp.NgayNhan AS ngayVao,
        dp.NgayTra AS ngayTra,
        dp.NgayDat AS ngayDat,
        DATEDIFF(dp.NgayTra, CURDATE()) AS thoiGianConLai,
        DATEDIFF(dp.NgayTra, dp.NgayNhan) AS thoiGian
      FROM datphong dp
      JOIN user u ON dp.MaKH = u.ID
      JOIN phong p ON dp.MaPhong = p.MaPhong
      WHERE dp.TrangThai = 'DA_THANH_TOAN';
    `;
    const [bookings] = await db.query(query);

    // Định dạng thời gian còn lại và thoiGian
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      thoiGianConLai: booking.thoiGianConLai > 0 ? `${booking.thoiGianConLai} ngày` : '0 ngày',
      thoiGian: `${booking.thoiGian} ngày`,
      gia: booking.gia,
      datPhongId: booking.MaDatPhong,
      ngayVao: formatDateLocal(booking.ngayVao),
      ngayTra: formatDateLocal(booking.ngayTra),
      ngayDat: formatDateLocal(booking.ngayDat),
    }));

    res.status(200).json({ bookings: formattedBookings });
  } catch (err) {
    console.error('Error fetching paid bookings:', err);
    res.status(500).json({ message: 'Error fetching paid bookings', error: err.message });
  }
};

// Lấy tất cả danh sách đặt phòng (các trạng thái)
const getAllBookings = async (req, res) => {
  try {
    const db = await dbPromise;

    const query = `
      SELECT 
        dp.MaDatPhong,
        u.HoTen AS ten,
        u.SoDienThoai AS sdt,
        p.TenLoaiPhong AS phong,
        p.GiaPhong AS gia,
        dp.NgayNhan AS ngayVao,
        dp.NgayTra AS ngayTra,
        dp.NgayDat AS ngayDat,
        DATEDIFF(dp.NgayTra, CURDATE()) AS thoiGianConLai,
        dp.TrangThai
      FROM datphong dp
      JOIN user u ON dp.MaKH = u.ID
      JOIN phong p ON dp.MaPhong = p.MaPhong;
    `;
    const [bookings] = await db.query(query);

    // Định dạng thời gian còn lại
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      thoiGianConLai: booking.thoiGianConLai > 0 ? `${booking.thoiGianConLai} ngày` : '0 ngày',
      gia: booking.gia,
      datPhongId: booking.MaDatPhong,
      ngayVao: formatDateLocal(booking.ngayVao),
      ngayTra: formatDateLocal(booking.ngayTra),
      ngayDat: formatDateLocal(booking.ngayDat),
      TrangThai: booking.TrangThai === 'DA_THUE' ? 'Đã Thuê' :
                 booking.TrangThai === 'DA_THANH_TOAN' ? 'Đã Thanh Toán' :
                 booking.TrangThai === 'DA_HUY' ? 'Đã Hủy' : booking.TrangThai,
    }));

    res.status(200).json({ bookings: formattedBookings });
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ message: 'Error fetching all bookings', error: err.message });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getBookings,
  updateBookingStatus,
  getBookedRoomsCount,
  getCancelledRoomsCount,
  getBookedRooms,
  getPaidBookings,
  getAllBookings,
};
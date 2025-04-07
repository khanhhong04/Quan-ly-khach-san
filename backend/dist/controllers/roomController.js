const dbPromise = require('../config/database');
const fs = require('fs');
const path = require('path');

const getAvailableRooms = async (req, res) => {
  const { checkIn, checkOut } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!checkIn || !checkOut) {
    return res.status(400).json({ message: 'Check-in and check-out dates are required' });
  }

  // Kiểm tra định dạng ngày
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormat.test(checkIn) || !dateFormat.test(checkOut)) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Kiểm tra checkOut phải sau checkIn
  if (new Date(checkOut) <= new Date(checkIn)) {
    return res.status(400).json({ message: 'Check-out date must be after check-in date' });
  }

  try {
    const db = await dbPromise;

    // Truy vấn lấy danh sách phòng trống
    const query = `
      SELECT MaPhong, SoPhong, Tang, TenLoaiPhong, SoNguoiToiDa, TrangThai, MoTa, GiaPhong
      FROM phong
      WHERE TrangThai = 'TRONG'
      AND MaPhong NOT IN (
        SELECT MaPhong
        FROM datphong
        WHERE (
          (NgayNhan <= ? AND NgayTra >= ?) -- Khoảng thời gian đặt phòng bao phủ checkIn
          OR (NgayNhan <= ? AND NgayTra >= ?) -- Khoảng thời gian đặt phòng bao phủ checkOut
          OR (NgayNhan >= ? AND NgayTra <= ?) -- Khoảng thời gian đặt phòng nằm trong checkIn-checkOut
        )
        AND TrangThai = 'DA_THUE' 
      );
    `;

    // Thay thế các tham số trong truy vấn
    const [results] = await db.query(query, [checkOut, checkIn, checkOut, checkOut, checkIn, checkIn, checkOut]);
      
    // Thêm danh sách ảnh cho từng phòng dựa trên tầng
    const imageDir = path.join(__dirname, '../public/images');
    const formattedResults = results.map(room => {
      const tang = room.Tang;
      const images = fs.readdirSync(imageDir)
        .filter(file => file.startsWith(`tang${tang}_`) && /\.(jpg|jpeg|png)$/i.test(file))
        .map(file => `/images/${file}`);
      return {
        ...room,
        GiaPhong: parseFloat(room.GiaPhong),
        images // Thêm danh sách ảnh
      };
    });

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ message: 'Error fetching rooms', error: err.message });
  }
};
// Hàm lấy chi tiết phòng
const getRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    const query = `
      SELECT MaPhong, SoPhong, Tang, TenLoaiPhong, SoNguoiToiDa, TrangThai, MoTa, GiaPhong
      FROM phong
      WHERE MaPhong = ?
    `;
    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    const room = results[0];
    const tang = room.Tang;
    const imageDir = path.join(__dirname, '../public/images');
    const images = fs.readdirSync(imageDir)
      .filter(file => file.startsWith(`tang${tang}_`) && /\.(jpg|jpeg|png)$/i.test(file))
      .map(file => `/images/${file}`);


    // Chuyển GiaPhong thành số
    const formattedResults = results.map(room => ({
      ...room,
      GiaPhong: parseFloat(room.GiaPhong)
    }));

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ message: 'Error fetching rooms', error: err.message });
  }
};

module.exports = {
  getAvailableRooms,
  getRoomById
};
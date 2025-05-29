const dbPromise = require('../config/database');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
      SELECT p.MaPhong, p.SoPhong, p.Tang, p.TenLoaiPhong, p.SoNguoiToiDa, p.MoTa, p.GiaPhong
      FROM phong p
      WHERE p.MaPhong NOT IN (
        SELECT dp.MaPhong
        FROM datphong dp
        WHERE (
          (dp.NgayNhan <= ? AND dp.NgayTra >= ?)
          OR (dp.NgayNhan <= ? AND dp.NgayTra >= ?)
          OR (dp.NgayNhan >= ? AND dp.NgayTra <= ?)
        )
        AND dp.TrangThai IN ('DA_THUE', 'DANG_SU_DUNG')
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
      SELECT MaPhong, SoPhong, Tang, TenLoaiPhong, SoNguoiToiDa, MoTa, GiaPhong
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
      GiaPhong: parseFloat(room.GiaPhong),
      images
    }));

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ message: 'Error fetching rooms', error: err.message });
  }
};
// thống kê cho admin
const getRoomStats = async (req, res) => {
  try {
    const db = await dbPromise;

    // Lấy tổng số loại phòng (distinct TenLoaiPhong)
    const [roomTypes] = await db.query(`
      SELECT COUNT(DISTINCT TenLoaiPhong) as loaiPhong
      FROM phong
    `);

    // Lấy tổng số phòng
    const [totalRooms] = await db.query(`
      SELECT COUNT(*) as tongPhong
      FROM phong
    `);

    // Lấy số phòng đang trống (Trạng thái TRONG)
    const [availableRooms] = await db.query(`
      SELECT COUNT(*) as phongTrong
      FROM phong
      WHERE TrangThai = 'TRONG'
    `);

    const stats = {
      loaiPhong: roomTypes[0].loaiPhong,
      tongPhong: totalRooms[0].tongPhong,
      phongTrong: availableRooms[0].phongTrong,
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error('Error fetching room stats:', err);
    res.status(500).json({ message: 'Error fetching room stats', error: err.message });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const db = await dbPromise;
    const query = `
      SELECT MaPhong, SoPhong, Tang, TenLoaiPhong, SoNguoiToiDa, MoTa, GiaPhong, TrangThai
      FROM phong
    `;
    const [results] = await db.query(query);

    const formattedResults = results.map(room => ({
      ...room,
      GiaPhong: parseFloat(room.GiaPhong),
    }));

    res.status(200).json({ rooms: formattedResults });
  } catch (err) {
    console.error('Error fetching all rooms:', err);
    res.status(500).json({ message: 'Error fetching all rooms', error: err.message });
  }
};

const addRoom = async (req, res) => {
  try {
    const { SoPhong, Tang, TenLoaiPhong, SoNguoiToiDa, MoTa, GiaPhong, TrangThai } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Không có token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 3) {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền thêm phòng' });
    }

    if (!SoPhong || !Tang || !TenLoaiPhong || !SoNguoiToiDa || !GiaPhong || !TrangThai) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const [result] = await dbPromise.execute(
      'INSERT INTO phong (SoPhong, Tang, TenLoaiPhong, SoNguoiToiDa, MoTa, GiaPhong, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [SoPhong, Tang, TenLoaiPhong, SoNguoiToiDa, MoTa, GiaPhong, TrangThai]
    );
    res.status(201).json({ message: 'Thêm phòng thành công', MaPhong: result.insertId });
  } catch (err) {
    console.error('Error adding room:', err);
    res.status(500).json({ message: 'Error adding room', error: err.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { SoPhong } = req.params; // Thay MaPhong bằng SoPhong
    console.log('SoPhong received:', SoPhong); // Log để debug
    const { Tang, TenLoaiPhong, SoNguoiToiDa, MoTa, GiaPhong, TrangThai } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Không có token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 3) {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền sửa phòng' });
    }

    if (!SoPhong || (!Tang && !TenLoaiPhong && !SoNguoiToiDa && !MoTa && !GiaPhong && !TrangThai)) {
      return res.status(400).json({ message: 'Vui lòng cung cấp thông tin để cập nhật' });
    }

    const updateFields = [];
    const values = [];
    if (Tang) { updateFields.push('Tang = ?'); values.push(Tang); }
    if (TenLoaiPhong) { updateFields.push('TenLoaiPhong = ?'); values.push(TenLoaiPhong); }
    if (SoNguoiToiDa) { updateFields.push('SoNguoiToiDa = ?'); values.push(SoNguoiToiDa); }
    if (MoTa) { updateFields.push('MoTa = ?'); values.push(MoTa); }
    if (GiaPhong) { updateFields.push('GiaPhong = ?'); values.push(GiaPhong); }
    if (TrangThai) { updateFields.push('TrangThai = ?'); values.push(TrangThai); }
    values.push(SoPhong); // Sử dụng SoPhong trong WHERE clause

    const query = `UPDATE phong SET ${updateFields.join(', ')} WHERE SoPhong = ?`; // Thay MaPhong bằng SoPhong
    const [result] = await dbPromise.execute(query, values);
    console.log('Update result:', result); // Log để debug

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }
    res.status(200).json({ message: 'Cập nhật phòng thành công' });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ message: 'Error updating room', error: err.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { SoPhong } = req.params; // Thay MaPhong bằng SoPhong
    console.log('SoPhong received for deletion:', SoPhong); // Log để debug
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Không có token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 3) {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền xóa phòng' });
    }

    if (!SoPhong) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số phòng' });
    }

    const [result] = await dbPromise.execute('DELETE FROM phong WHERE SoPhong = ?', [SoPhong]); // Thay MaPhong bằng SoPhong
    console.log('Delete result:', result); // Log để debug

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa phòng thành công' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ message: 'Error deleting room', error: err.message });
  }
};

module.exports = {
  getAvailableRooms,
  getRoomById,
  getRoomStats,
  getAllRooms,
  addRoom,
  updateRoom,
  deleteRoom
};
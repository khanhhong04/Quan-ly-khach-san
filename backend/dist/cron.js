const cron = require('node-cron');
const dbPromise = require('./config/database');

const setupCronJobs = () => {
  // Chạy hàng ngày vào lúc 00:00 để cập nhật trạng thái
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily status update cron job...');
    try {
      const db = await dbPromise;
      const today = new Date().toISOString().split('T')[0];

      // Cập nhật trạng thái từ DA_THUE sang DANG_SU_DUNG khi đến ngày nhận phòng
      const updateToUsingQuery = `
        UPDATE datphong
        SET TrangThai = 'DANG_SU_DUNG'
        WHERE NgayNhan = ? AND TrangThai = 'DA_THUE';
      `;
      await db.query(updateToUsingQuery, [today]);
      console.log(`Updated bookings to DANG_SU_DUNG for check-in date ${today}`);

      // Cập nhật trạng thái từ DANG_SU_DUNG sang TRONG khi đến ngày trả phòng
      const updateToAvailableQuery = `
        UPDATE datphong
        SET TrangThai = 'TRONG'
        WHERE NgayTra = ? AND TrangThai = 'DANG_SU_DUNG';
      `;
      await db.query(updateToAvailableQuery, [today]);
      console.log(`Updated bookings to TRONG for check-out date ${today}`);
    } catch (err) {
      console.error('Error running status update cron job:', err);
    }
  });
};

module.exports = { setupCronJobs };
const dbPromise = require("../config/database");
const { createHmacSignature } = require("../utils/hmac");
const { sendExcessAmountNotification } = require("../utils/sendEmail");

const SECRET_KEY = "06072004"; // Đảm bảo khớp với SECRET_KEY trong thanhtoan.tsx

exports.createPayment = async (req, res) => {
  let connection;
  try {
    const { bookingId, paymentMethod, transactionId, amount, paymentAmount, change, status, timestamp, customerEmail } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!bookingId || !paymentMethod || !transactionId || !amount || !paymentAmount || !status || !timestamp || !customerEmail) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán." });
    }

    // Ép kiểu bookingId thành số
    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      return res.status(400).json({ message: "Mã đặt phòng không hợp lệ." });
    }

    // Kiểm tra timestamp (ngăn replay attack)
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
      return res.status(400).json({ message: "Timestamp không hợp lệ." });
    }

    // Tạo dữ liệu để kiểm tra chữ ký, ép kiểu tất cả thành chuỗi
    const dataToSign = {
      bookingId: String(bookingId),
      paymentMethod: String(paymentMethod),
      transactionId: String(transactionId),
      amount: String(amount),
      paymentAmount: String(paymentAmount),
      change: String(change || 0),
      status: String(status),
      timestamp: String(timestamp),
    };

    const receivedSignature = req.headers["x-payment-signature"];
    const expectedSignature = createHmacSignature(dataToSign, SECRET_KEY);

    if (receivedSignature !== expectedSignature) {
      return res.status(400).json({ message: "Chữ ký không hợp lệ." });
    }

    // Kiểm tra số tiền
    if (parseFloat(paymentAmount) < parseFloat(amount)) {
      return res.status(400).json({ message: "Số tiền thanh toán không đủ." });
    }

    // Kết nối cơ sở dữ liệu và bắt đầu transaction
    connection = await dbPromise.getConnection();
    console.log("Kết nối cơ sở dữ liệu thành công:", connection);
    await connection.beginTransaction();

    // Kiểm tra xem đặt phòng đã thanh toán chưa
    const [existingPayment] = await connection.query(
      "SELECT * FROM hoadon WHERE MaDatPhong = ? AND TrangThai = 'Đã thanh toán'",
      [bookingIdNum]
    );
    if (existingPayment.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Đặt phòng đã được thanh toán trước đó." });
    }

    // Kiểm tra đặt phòng
    const [booking] = await connection.query("SELECT * FROM datphong WHERE MaDatPhong = ? AND TrangThai = 'DA_THUE'", [bookingIdNum]);
    if (!booking.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Đặt phòng không tồn tại hoặc không ở trạng thái đã đặt." });
    }

    // Ánh xạ status
    const paymentStatus = status === "completed" ? "Đã thanh toán" : "Chưa thanh toán";

    // Lưu thanh toán vào MySQL
    const [result] = await connection.query(
      "INSERT INTO hoadon (MaDatPhong, NgayThanhToan, TongTien, PhuongThucThanhToan, MaGiaoDich, SoTienThanhToan, SoTienHoanLai, TrangThai) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)",
      [bookingIdNum, amount, paymentMethod, transactionId, paymentAmount, change || 0, paymentStatus]
    );

    // Xử lý tiền thừa nếu có
    if (parseFloat(change) > 0 && paymentMethod === "digital_wallet") {
      // Gửi email thông báo số tiền thừa
      const paymentDetails = {
        paymentId: result.insertId,
        bookingId: bookingId,
        excessAmount: parseFloat(change),
      };
      await sendExcessAmountNotification(customerEmail, paymentDetails);
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({ message: "Lưu thông tin thanh toán thành công.", paymentId: result.insertId });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Lỗi khi lưu thanh toán:", error);
    res.status(500).json({ message: "Lỗi khi lưu thanh toán.", error: error.message, stack: error.stack });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
const crypto = require('crypto');
const dbPromise = require("../config/database");
const axios = require('axios');

require('dotenv').config();

const createMoMoPaymentUrl = async (req, res) => {
  let connection;
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Thiếu mã đặt phòng (bookingId)." });
    }

    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      return res.status(400).json({ message: "Mã đặt phòng không hợp lệ." });
    }

    connection = await dbPromise.getConnection();
    const [booking] = await connection.query(
      "SELECT dp.MaDatPhong, dp.MaKH, dp.NgayNhan, dp.NgayTra, dp.MaPhong, p.GiaPhong " +
      "FROM datphong dp " +
      "JOIN phong p ON dp.MaPhong = p.MaPhong " +
      "WHERE dp.MaDatPhong = ? AND dp.TrangThai = 'DA_THUE'",
      [bookingIdNum]
    );

    if (!booking.length) {
      return res.status(400).json({ message: "Đặt phòng không tồn tại hoặc không ở trạng thái đã đặt." });
    }

    const checkInDate = new Date(booking[0].NgayNhan);
    const checkOutDate = new Date(booking[0].NgayTra);
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const amount = booking[0].GiaPhong * days;

    if (amount <= 0) {
      return res.status(400).json({ message: "Số tiền không hợp lệ." });
    }

    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const orderId = `ORDER-${bookingIdNum}-${Date.now()}`;
    const requestId = orderId;
    const orderInfo = `Thanh toan dat phong ${bookingIdNum}`;
    const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://localhost:3001/api/payments/momo_return";
    const ipnUrl = process.env.MOMO_IPN_URL || "http://localhost:3001/api/payments/momo_ipn";
    const amountStr = amount.toString();
    const requestType = "payWithMethod";
    const extraData = "";
    const lang = "vi";
    const autoCapture = true;
    const orderGroupId = "";

    const rawSignature = `accessKey=${accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);

    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    const requestBody = {
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amountStr,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature
    };

    const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
    const { payUrl, resultCode, message } = response.data;

    if (!payUrl || resultCode !== 0) {
      console.log("MoMo Error:", message);
      return res.status(500).json({ message: "Không thể tạo URL thanh toán MoMo.", error: message });
    }

    res.json({ paymentUrl: payUrl });
  } catch (error) {
    console.error("Lỗi khi tạo URL thanh toán MoMo:", error.message);
    res.status(500).json({ message: "Lỗi khi tạo URL thanh toán MoMo.", error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const handleMoMoReturn = async (req, res) => {
  let connection;
  try {
    const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = req.query;

    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Chữ ký không hợp lệ." });
    }

    const bookingId = parseInt(orderId.split('-')[1]);
    const paymentStatus = resultCode === "0" ? 'Đã thanh toán' : 'Chưa thanh toán';

    if (resultCode !== "0") {
      console.log("Giao dịch thất bại:", resultCode, message);
      return res.status(400).json({ message: "Thanh toán không thành công.", resultCode, message });
    }

    connection = await dbPromise.getConnection();
    await connection.beginTransaction();

    const [existingPayment] = await connection.query(
      "SELECT * FROM hoadon WHERE MaDatPhong = ? AND TrangThai = 'Đã thanh toán'",
      [bookingId]
    );
    if (existingPayment.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Đặt phòng đã được thanh toán trước đó." });
    }

    const [booking] = await connection.query(
      "SELECT * FROM datphong WHERE MaDatPhong = ? AND TrangThai = 'DA_THUE'",
      [bookingId]
    );
    if (!booking.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Đặt phòng không tồn tại hoặc không ở trạng thái đã đặt." });
    }

    const [result] = await connection.query(
      "INSERT INTO hoadon (MaDatPhong, NgayThanhToan, TongTien, PhuongThucThanhToan, MaGiaoDich, SoTienThanhToan, SoTienHoanLai, TrangThai) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)",
      [bookingId, amount, 'momo', transId, amount, 0, paymentStatus]
    );

    await connection.query(
      "UPDATE datphong SET TrangThai = 'DA_THANH_TOAN' WHERE MaDatPhong = ?",
      [bookingId]
    );

    await connection.commit();

    res.status(200).json({ message: "Thanh toán thành công và hóa đơn đã được lưu.", paymentId: result.insertId });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Lỗi khi xử lý phản hồi MoMo:", error);
    res.status(500).json({ message: "Lỗi khi xử lý phản hồi MoMo.", error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const handleMoMoIPN = async (req, res) => {
  let connection;
  try {
    const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = req.body;

    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log("IPN: Chữ ký không hợp lệ.");
      return res.status(400).send("Invalid signature");
    }

    const bookingId = parseInt(orderId.split('-')[1]);
    const paymentStatus = resultCode === "0" ? 'Đã thanh toán' : 'Chưa thanh toán';

    if (resultCode !== "0") {
      console.log("IPN: Giao dịch thất bại:", resultCode, message);
      return res.status(200).send("OK");
    }

    connection = await dbPromise.getConnection();
    await connection.beginTransaction();

    const [existingPayment] = await connection.query(
      "SELECT * FROM hoadon WHERE MaDatPhong = ? AND TrangThai = 'Đã thanh toán'",
      [bookingId]
    );
    if (existingPayment.length > 0) {
      await connection.rollback();
      console.log("IPN: Đặt phòng đã được thanh toán trước đó.");
      return res.status(200).send("OK");
    }

    const [booking] = await connection.query(
      "SELECT * FROM datphong WHERE MaDatPhong = ? AND TrangThai = 'DA_THUE'",
      [bookingId]
    );
    if (!booking.length) {
      await connection.rollback();
      console.log("IPN: Đặt phòng không tồn tại hoặc không ở trạng thái đã đặt.");
      return res.status(200).send("OK");
    }

    const [result] = await connection.query(
      "INSERT INTO hoadon (MaDatPhong, NgayThanhToan, TongTien, PhuongThucThanhToan, MaGiaoDich, SoTienThanhToan, SoTienHoanLai, TrangThai) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)",
      [bookingId, amount, 'momo', transId, amount, 0, paymentStatus]
    );

    await connection.query(
      "UPDATE datphong SET TrangThai = 'DA_THANH_TOAN' WHERE MaDatPhong = ?",
      [bookingId]
    );

    await connection.commit();
    console.log("IPN: Giao dịch đã được lưu thành công.");
    res.status(200).send("OK");
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Lỗi khi xử lý IPN MoMo:", error);
    res.status(200).send("OK");
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createMoMoPaymentUrl,
  handleMoMoReturn,
  handleMoMoIPN
};
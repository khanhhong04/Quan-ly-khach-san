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
    const redirectUrl = process.env.MOMO_REDIRECT_URL || "https://93fa-14-232-191-188.ngrok-free.app               /api/payments/momo_return";
    const ipnUrl = process.env.MOMO_IPN_URL || "https://93fa-14-232-191-188.ngrok-free.app               /api/payments/momo_ipn";
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

    // Xác minh chữ ký
    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    console.log("MoMo Return - Received Query:", req.query);
    console.log("MoMo Return - Calculated Signature:", expectedSignature);
    console.log("MoMo Return - Received Signature:", signature);

    if (signature !== expectedSignature) {
      console.log("MoMo Return - Chữ ký không hợp lệ.");
      return res.status(400).json({ message: "Chữ ký không hợp lệ." });
    }

    const bookingId = parseInt(orderId.split('-')[1]);

    // Kiểm tra trạng thái giao dịch từ MoMo
    if (resultCode != 0) {
      console.log("MoMo Return - Giao dịch thất bại:", resultCode, message);
      return res.status(400).json({ message: "Thanh toán không thành công.", resultCode, message });
    }

    // Không cần kiểm tra lại và xử lý giao dịch, vì IPN đã làm việc này
    // Chỉ redirect về deep link
    console.log("MoMo Return - Redirecting to app with bookingId:", bookingId);
    res.redirect(`myapp://payment-result?bookingId=${bookingId}`);
  } catch (error) {
    console.error("Lỗi khi xử lý phản hồi MoMo:", error.message);
    res.status(500).json({ message: "Lỗi khi xử lý phản hồi MoMo.", error: error.message });
  }
};

const handleMoMoIPN = async (req, res) => {
  console.log("MoMo IPN - Received request at:", new Date().toISOString());
  console.log("MoMo IPN - Body params:", req.body);
  let connection;
  try {
    console.log("Running paymentController.js from:", __filename);
    console.log("MoMo IPN - Request received");

    const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = req.body;

    console.log("MoMo IPN - Received Body:", req.body);

    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    console.log("MoMo IPN - Calculated Signature:", expectedSignature);
    console.log("MoMo IPN - Received Signature:", signature);

    if (signature !== expectedSignature) {
      console.log("MoMo IPN - Chữ ký không hợp lệ.");
      return res.status(400).send("Invalid signature");
    }

    const bookingId = parseInt(orderId.split('-')[1]);
    const paymentStatus = resultCode == 0 ? 'Đã thanh toán' : 'Chưa thanh toán';

    if (resultCode != 0) {
      console.log("MoMo IPN - Giao dịch thất bại:", resultCode, message);
      return res.status(200).send("OK");
    }

    console.log("MoMo IPN - Bắt đầu xử lý giao dịch thành công:", { bookingId, transId });

    connection = await dbPromise.getConnection();
    console.log("MoMo IPN - Kết nối database thành công");

    await connection.beginTransaction();
    console.log("MoMo IPN - Bắt đầu transaction");

    const [existingPayment] = await connection.query(
      "SELECT * FROM hoadon WHERE MaDatPhong = ? AND TrangThai = 'Đã thanh toán'",
      [bookingId]
    );
    console.log("MoMo IPN - Kiểm tra existingPayment:", existingPayment);
    if (existingPayment.length > 0) {
      await connection.rollback();
      console.log("MoMo IPN - Đặt phòng đã được thanh toán trước đó:", bookingId);
      return res.status(200).send("OK");
    }

    const [booking] = await connection.query(
      "SELECT * FROM datphong WHERE MaDatPhong = ? AND TrangThai = 'DA_THUE'",
      [bookingId]
    );
    console.log("MoMo IPN - Kiểm tra booking:", booking);
    if (!booking.length) {
      await connection.rollback();
      console.log("MoMo IPN - Đặt phòng không tồn tại hoặc không ở trạng thái đã đặt:", bookingId);
      return res.status(200).send("OK");
    }

    const [result] = await connection.query(
      "INSERT INTO hoadon (MaDatPhong, NgayThanhToan, TongTien, TrangThai, PhuongThucThanhToan, MaGiaoDich, SoTienThanhToan, SoTienHoanLai) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)",
      [bookingId, parseFloat(amount), paymentStatus, 'momo', transId, parseFloat(amount), 0]
    );
    console.log("MoMo IPN - Insert vào hoadon thành công:", result);

    await connection.query(
      "UPDATE datphong SET TrangThai = 'DA_THANH_TOAN' WHERE MaDatPhong = ?",
      [bookingId]
    );
    console.log("MoMo IPN - Update datphong thành công");

    await connection.commit();
    console.log("MoMo IPN - Commit transaction thành công");
    console.log("MoMo IPN - Giao dịch đã được lưu thành công:", { bookingId, paymentId: result.insertId });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.log("MoMo IPN - Rollback transaction do lỗi");
    }
    console.error("Lỗi khi xử lý IPN MoMo:", error.message);
    res.status(200).send("OK");
  } finally {
    if (connection) {
      connection.release();
      console.log("MoMo IPN - Đã release connection");
    }
  }
};

// tổng tiền
const getTotalRevenue = async (req, res) => {
  try {
    const db = await dbPromise;
    const query = `
      SELECT COALESCE(SUM(TongTien), 0) as totalRevenue
      FROM hoadon
      WHERE TrangThai = 'Đã thanh toán';
    `;
    const [result] = await db.query(query);

    res.status(200).json({ totalRevenue: result[0].totalRevenue });
  } catch (err) {
    console.error('Error fetching total revenue:', err);
    res.status(500).json({ message: 'Error fetching total revenue', error: err.message });
  }
};

module.exports = {
  createMoMoPaymentUrl,
  handleMoMoReturn,
  handleMoMoIPN,
  getTotalRevenue
};
const nodemailer = require('nodemailer');

// Cấu hình transporter cho Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Lấy từ .env
    pass: process.env.EMAIL_PASS, // Lấy từ .env
  },
});

// Hàm gửi email xác nhận đặt phòng
const sendBookingConfirmation = async (to, bookingDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to, // Email khách hàng
      subject: 'Xác nhận đặt phòng thành công',
      html: `
        <h2>Xác nhận đặt phòng</h2>
        <p>Cảm ơn bạn đã đặt phòng với chúng tôi!</p>
        <p><strong>Mã đặt phòng:</strong> ${bookingDetails.bookingId}</p>
        <p><strong>Ngày nhận phòng:</strong> ${bookingDetails.checkInDate}</p>
        <p><strong>Ngày trả phòng:</strong> ${bookingDetails.checkOutDate}</p>
        <p><strong>Mã phòng:</strong> ${bookingDetails.roomId}</p>
        <p>Vui lòng liên hệ nếu có thắc mắc!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Hàm gửi email thông báo hủy phòng
const sendCancellationConfirmation = async (to, cancellationDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to, // Email khách hàng
      subject: 'Thông báo hủy đặt phòng',
      html: `
        <h2>Thông báo hủy đặt phòng</h2>
        <p>Đặt phòng của bạn đã được hủy theo yêu cầu.</p>
        <p><strong>Mã đặt phòng:</strong> ${cancellationDetails.bookingId}</p>
        <p><strong>Ngày nhận phòng:</strong> ${cancellationDetails.checkInDate}</p>
        <p><strong>Ngày trả phòng:</strong> ${cancellationDetails.checkOutDate}</p>
        <p><strong>Mã phòng:</strong> ${cancellationDetails.roomId}</p>
        <p>Nếu bạn không yêu cầu hủy đặt phòng này, vui lòng liên hệ ngay với chúng tôi!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent successfully to', to);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
};

// Hàm gửi email chứa mã OTP
const sendOTPEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Mã OTP để đặt lại mật khẩu',
      html: `
        <h2>Mã OTP đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Dưới đây là mã OTP của bạn:</p>
        <h3>${otp}</h3>
        <p>Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to', to);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = { sendBookingConfirmation, sendCancellationConfirmation, sendOTPEmail };
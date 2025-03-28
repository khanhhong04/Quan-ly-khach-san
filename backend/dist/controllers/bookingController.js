const getBookings = (req, res) => {
    res.json({ message: "Danh sách booking" });
};

const createBooking = (req, res) => {
    res.json({ message: "Tạo booking mới" });
};

module.exports = { getBookings, createBooking }; // Đảm bảo export đúng

const dbPromise = require('../config/database');

const handleWebhook = async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    let responseText = '';

    try {
        const db = await dbPromise;

        if (intent === 'CheckRoomAvailability') {
            // Lấy ngày check-in và check-out từ parameters (Dialogflow gửi dưới dạng ISO: YYYY-MM-DDThh:mm:ssZ)
            let checkInDate = parameters.checkInDate.split('T')[0]; // Định dạng YYYY-MM-DD
            let checkOutDate = parameters.checkOutDate ? parameters.checkOutDate.split('T')[0] : null;

            // Xử lý trường hợp "ngày mai"
            if (checkInDate.includes('tomorrow')) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                checkInDate = tomorrow.toISOString().split('T')[0];
            }

            // Nếu không có ngày check-out, giả định là 1 ngày (có thể điều chỉnh logic)
            if (!checkOutDate) {
                const nextDay = new Date(checkInDate);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutDate = nextDay.toISOString().split('T')[0];
            }

            // Kiểm tra phòng trống
            const checkAvailabilityQuery = `
                SELECT MaPhong
                FROM datphong
                WHERE (
                    (NgayNhan <= ? AND NgayTra >= ?)
                    OR (NgayNhan <= ? AND NgayTra >= ?)
                    OR (NgayNhan >= ? AND NgayTra <= ?)
                )
                AND TrangThai IN ('DA_THUE', 'DANG_SU_DUNG');
            `;
            const [bookedRooms] = await db.query(checkAvailabilityQuery, [
                checkOutDate,
                checkInDate,
                checkOutDate,
                checkInDate,
                checkInDate,
                checkOutDate,
            ]);

            const bookedRoomIds = bookedRooms.map(room => room.MaPhong);

            // Lấy danh sách tất cả phòng có trạng thái TRONG
            const getRoomsQuery = `SELECT MaPhong, TrangThai FROM phong WHERE TrangThai = 'TRONG';`;
            const [allRooms] = await db.query(getRoomsQuery);

            // Lọc phòng trống
            const availableRooms = allRooms.filter(room => !bookedRoomIds.includes(room.MaPhong));

            if (availableRooms.length > 0) {
                responseText = `Có ${availableRooms.length} phòng trống từ ${checkInDate} đến ${checkOutDate}. Bạn muốn đặt phòng không?`;
            } else {
                responseText = `Rất tiếc, không có phòng trống trong khoảng thời gian từ ${checkInDate} đến ${checkOutDate}.`;
            }
        } else {
            responseText = 'Xin lỗi, tôi chưa hiểu ý bạn. Bạn có thể nói rõ hơn không?';
        }
    } catch (error) {
        console.error('Error in chatbot webhook:', error);
        responseText = 'Đã có lỗi xảy ra, vui lòng thử lại sau.';
    }

    res.json({
        fulfillmentText: responseText,
    });
};

module.exports = { handleWebhook };
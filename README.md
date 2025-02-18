# Quan ly khach san
Buổi 1:
Mô tả bài toán
Một khách sạn yêu cầu viết một phần mềm quản lý khách sạn. Chương trình cho phép quản lý khách thuê phòng, quản lý phòng, trang thiết bị trong phòng và nhân viên.
Chương trình cung cấp cho người dùng một tài khoản đăng nhập và đăng xuất để sử dụng hệ thống quản lý này. Với một tài khoản đăng nhập hệ thống sẽ xác định người đăng nhập là nhân viên hay quản lý để cung cấp quyền hạn tương ứng cho từng tài khoản đăng nhập.



Nhân viên hay quản lý phải nhập các thông tin của khách hàng (tên, email, số điện thoại,…) khi khách đặt phòng hay thuê phòng trực tiếp. Khi một phòng được cho thuê hoặc có người đặt phòng thì nhân viên cập nhật tình trạng phòng. Khi đến ngày nhận phòng, nếu khách hàng đến nhận phòng thì nhân viên phải cập nhật lại tình trạng phòng là phòng đang được thuê; nếu khách hàng không đến nhận phòng đúng thời hạn hoặc hủy đặt phòng trước thời hạn thì nhân viên phải hủy thông tin khách hàng và cập nhật lại tình trạng phòng là phòng trống.
Ngoài ra, nhân viên phải ghi nhận loại thiết bị và số lượng trong mỗi phòng. Nhân viên có quyền thêm, xóa và cập nhật lại các thiết bị trong phòng. Khi khách hàng thuê phòng nếu có yêu cầu thêm trang thiết bị trong phòng thì nhân viên phải bổ sung thông tin về trang thiết bị trong phòng nếu yêu cầu của khách được đáp ứng.
Trong khách sạn còn có sẵn các dịch vụ (massage, tắm hơi,…) để phục vụ khách hàng. Khi khách có nhu cầu thì nhân viên phải ghi nhận tiền dịch vụ để tính vào tổng tiền.
Khi khách hàng trả phòng, hệ thống sẽ tự động tính tiền thuê phòng, tiền dịch vụ và tổng tiền khách hàng phải trả. Nếu khách hàng có thắc mắc thì nhân viên cũng có thể cho khách hàng xem trực tiếp những chi phí mà khách hàng sử dụng đã lưu trên hệ thống.
Đối với người quản lý, ngoài những quyền của nhân viên, người quản lý còn có thể cập nhật tên phòng, giá phòng và loại phòng khi có sự thay đổi. Ngoài ra, người quản lý còn cập nhật thông tin và tài khoản đăng nhập của nhân viên vào hệ thống.
Hệ thống còn hỗ trợ chức năng báo cáo để nhân viên có thể báo cáo doanh thu của khách sạn theo tháng hoặc theo quý một cách chi tiết và rõ ràng.

Yêu cầu hệ thống:
1.	Hệ thống phải hỗ trợ việc đặt phòng nhiều loại phòng khác nhau như phòng tiêu chuẩn, phòng sang trọng, phòng gia đình, v.v.
2.	Khách có thể tìm kiếm phòng trống và đặt bất kỳ phòng nào còn trống.
3.	Hệ thống phải có khả năng thu thập thông tin, chẳng hạn như ai đã đặt phòng cụ thể hoặc khách hàng cụ thể đã đặt phòng nào.
4.	Hệ thống phải cho phép khách hàng hủy đặt phòng - và hoàn lại toàn bộ tiền nếu việc hủy diễn ra trước 24 giờ so với ngày nhận phòng.
5.	Hệ thống phải có khả năng gửi thông báo bất cứ khi nào ngày đặt phòng gần đến ngày nhận phòng hoặc ngày trả phòng.
6.	Hệ thống phải duy trì nhật ký dọn phòng để theo dõi mọi công việc dọn phòng.
7.	Bất kỳ khách hàng nào cũng có thể thêm dịch vụ phòng và đồ ăn.
8.	Khách hàng có thể thanh toán hóa đơn bằng thẻ tín dụng, séc hoặc tiền mặt.


- ĐẶC TẢ YÊU CẦU NGHIỆP VỤ HỆ THỐNG QUẢN LÝ KHÁCH SẠN 
1. Giới thiệu 
1.1 Mô tả tổng quan Hệ thống quản lý khách sạn giúp tự động hóa các quy trình như đặt phòng, thanh toán, quản lý khách hàng, nhân viên, dịch vụ khách sạn, báo cáo doanh thu, v.v. 
1.2 Đối tượng sử dụng Quản lý khách sạn (Admin) ,Khách hàng ,Nhân viên lễ tân (dọn phòng, phục vụ) 
Admin (Người quản lý):
Quản lý có thể đăng nhập website của họ.
Quản lý có thể xem, thay đổi trạng thái phòng, thêm, sửa, xoá, tìmkiếm các phòng.
Quản lý có thể xem, thêm, sửa, xoá, tìm kiếm các dịch vụ.
Quản lý có thể xem, thêm, sửa, xoá, tìm kiếm các thông tin củakhách hàng.
Quản lý có thể xem, thêm, sửa, xoá, tìm kiếm các thông tin củanhân viên.
Quản lý có thể phân quyền cho các thành viên sử dụng hệ thống.
Quản lý có thể thanh toán hóa đơn.
Nhân viên lễ tân:
Đặt phòng cho khách.
Thanh toán và thay đổi trạng thái của phòng.
Gọi các dịch vụ mà khách hàng yêu cầu. 
Quản lý, sắp xếp, liên hệ với khách hàng đã đặt phòng trên website.
Khách hàng:
Khách hàng có thể tìm kiếm thông tin theo tên, giá cả ...
Khách hàng có thể xem tất cả các phòng có mặt ở website.
Khách hàng có thể đặt phòng trước ở website.
2. Yêu cầu nghiệp vụ 
2.1 Chức năng hệ thống 
 1. Quản lý đặt phòng 
Khách hàng có thể: Tìm kiếm phòng trống theo ngày. Đặt phòng, hủy phòng. Nhận email xác nhận đặt phòng.
Lễ tân có thể: Kiểm tra tình trạng phòng. Cập nhật trạng thái phòng (trống, đã đặt, đang sử dụng). 
 2. Quản lý khách hàng 
 Khách hàng có thể: Đăng ký, đăng nhập tài khoản. Cập nhật thông tin cá nhân. Xem lịch sử đặt phòng.
 Admin có thể: Xem danh sách khách hàng. Xóa tài khoản vi phạm. 
 3. Quản lý thanh toán 
 Hệ thống hỗ trợ: Thanh toán online (VNPay, Momo, Visa, Mastercard). Xuất hóa đơn điện tử. Lưu lịch sử thanh toán. 
Kế toán có thể: Theo dõi công nợ khách hàng. Quản lý doanh thu.
  4. Quản lý nhân viên 
 Admin có thể: Thêm, sửa, xóa nhân viên. Phân quyền tài khoản (Lễ tân, Dọn phòng, Kế toán). Quản lý ca làm việc. 
 5. Quản lý dịch vụ khách sạn 
Khách hàng có thể: Đặt thêm dịch vụ (Ăn uống, Spa, Giặt ủi). 
 Nhân viên có thể: Xác nhận và phục vụ dịch vụ. Cập nhật trạng thái dịch vụ đã hoàn thành. 
 6. Báo cáo & Thống kê 
Admin có thể xem các báo cáo: Doanh thu theo ngày/tháng/năm. Số lượng phòng đã đặt. Hiệu suất nhân viên.


Đặc tả thiết kế cơ sở dữ liệu:

1. Xác định yêu cầu hệ thống
Khách sạn cần quản lý những gì? (phòng, khách hàng, đặt phòng, nhân viên, dịch vụ, hóa đơn, v.v.)
Luồng nghiệp vụ chính: đặt phòng, hủy phòng, check-in, check-out, thanh toán, sử dụng dịch vụ.
Các quy tắc kinh doanh: ví dụ, khách không được đặt phòng đã có người ở, hóa đơn phải được thanh toán trước khi check-out, v.v.
2. Xây dựng mô hình thực thể - quan hệ (ERD)
Xác định các thực thể chính (entities): Khách hàng, Phòng, Đặt phòng, Nhân viên, Dịch vụ, Hóa đơn, v.v.
Xác định thuộc tính (attributes) của từng thực thể.
Xác định mối quan hệ (relationships) giữa các thực thể:
Một khách có thể đặt nhiều phòng.
Một phòng có thể có nhiều đặt phòng (vào các thời điểm khác nhau).
Một hóa đơn thuộc về một lần đặt phòng.
Một khách có thể sử dụng nhiều dịch vụ.
3. Thiết kế bảng dữ liệu (Schema Design)
Chuyển mô hình ERD thành các bảng trong MySQL.
Xác định khóa chính (Primary Key) và khóa ngoại (Foreign Key).
Xác định kiểu dữ liệu phù hợp cho từng cột.
Định nghĩa các ràng buộc dữ liệu (NOT NULL, UNIQUE, CHECK, DEFAULT, v.v.).
Áp dụng chuẩn hóa (Normalization) để tránh trùng lặp dữ liệu.
4. Ràng buộc toàn vẹn dữ liệu
Toàn vẹn miền giá trị (Domain Integrity): Kiểu dữ liệu hợp lý (ví dụ, giá phòng phải > 0, số điện thoại phải có định dạng hợp lệ).
Toàn vẹn thực thể (Entity Integrity): Mỗi bảng cần có khóa chính duy nhất.
Toàn vẹn tham chiếu (Referential Integrity): Ràng buộc khóa ngoại giữa các bảng để tránh mất dữ liệu quan trọng.
5. Tối ưu hóa hiệu suất
Chỉ mục (INDEX): Đánh chỉ mục trên các cột thường được tìm kiếm (số phòng, số điện thoại khách hàng, email).
Partitioning: Nếu dữ liệu lớn, có thể phân vùng hóa đơn theo thời gian (theo tháng, năm).
Caching: Nếu cần hiệu suất cao, có thể dùng Redis để cache dữ liệu phòng trống.
6. Kiểm thử và triển khai
Tạo dữ liệu mẫu để kiểm tra truy vấn (INSERT dữ liệu giả lập).
Chạy các truy vấn thử nghiệm để đảm bảo dữ liệu chính xác.
Kiểm tra hiệu suất khi dữ liệu lớn.
Triển khai vào hệ thống thực tế.

Mô hình quan hệ:
![image](https://github.com/user-attachments/assets/d3874611-5324-4222-a832-11328ee52998)
Biểu đồ phân rã chức năng:
![image](https://github.com/user-attachments/assets/09df9460-22ad-4ebb-b631-33c5f47b7bd2)

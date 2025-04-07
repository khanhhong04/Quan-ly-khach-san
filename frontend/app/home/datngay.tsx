import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Định nghĩa interface cho Room (đồng bộ với timkiem.tsx và ttphong.tsx)
interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  maxPeople: number;
  floor: number;
  images: string[]; // Đồng bộ với timkiem.tsx và ttphong.tsx
}

// Định nghĩa interface cho kết quả thanh toán
interface PaymentResult {
  success: boolean;
  transactionId: string | null;
}

export default function ConfirmBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Lấy thông tin từ params (truyền từ ttphong.tsx)
  const rooms: Room[] = params.rooms ? JSON.parse(params.rooms as string) : [];
  const totalPrice = parseFloat(params.totalPrice as string) || 0;
  const totalServicePrice = parseFloat(params.totalServicePrice as string) || 0;
  const finalPrice = parseFloat(params.finalPrice as string) || 0;
  const checkInDate = params.checkInDate as string;
  const checkOutDate = params.checkOutDate as string;
  const selectedServices = params.selectedServices
    ? JSON.parse(params.selectedServices as string)
    : {};

  // State cho thông tin khách hàng, phương thức thanh toán, và chi tiết thanh toán
  const [customerName, setCustomerName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [digitalWallet, setDigitalWallet] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State cho đếm ngược thời gian giữ phòng (10 phút = 600 giây)
  const [timeLeft, setTimeLeft] = useState<number>(600); // 600 giây = 10 phút
  const [isRoomReserved, setIsRoomReserved] = useState<boolean>(true); // Giả lập trạng thái giữ phòng

  // Danh sách phương thức thanh toán
  const paymentMethods = [
    { label: "Tiền mặt", value: "cash" },
    { label: "Thẻ tín dụng", value: "credit_card" },
    { label: "Ví điện tử", value: "digital_wallet" },
  ];

  // Danh sách ví điện tử
  const digitalWallets = [
    { label: "MoMo", value: "momo" },
    { label: "ZaloPay", value: "zalopay" },
    { label: "VNPay", value: "vnpay" },
  ];

  // Load phương thức thanh toán mặc định từ AsyncStorage
  useEffect(() => {
    const loadPaymentMethod = async () => {
      try {
        const savedPaymentMethod = await AsyncStorage.getItem("defaultPaymentMethod");
        if (savedPaymentMethod) {
          setPaymentMethod(savedPaymentMethod);
        }
      } catch (err) {
        console.error("Error loading payment method:", err);
      }
    };
    loadPaymentMethod();
  }, []);

  // Đếm ngược thời gian giữ phòng
  useEffect(() => {
    // Giả lập kiểm tra trạng thái giữ phòng (có thể thay bằng API)
    const checkRoomReservation = async () => {
      // Giả lập: Nếu phòng đã được người khác đặt (trong thực tế, gọi API để kiểm tra)
      const isRoomTaken = false; // Thay bằng logic gọi API
      if (isRoomTaken) {
        setIsRoomReserved(false);
        Alert.alert(
          "Phòng đã được đặt",
          "Rất tiếc, phòng đã được người khác đặt. Vui lòng chọn phòng khác.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/home/timkiem"),
            },
          ]
        );
        return;
      }
    };

    checkRoomReservation();

    // Đếm ngược thời gian
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          if (isRoomReserved) {
            setIsRoomReserved(false);
            Alert.alert(
              "Hết thời gian giữ phòng",
              "Thời gian giữ phòng đã hết. Vui lòng chọn lại phòng.",
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/home/trangchu"),
                },
              ]
            );
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(timer);
  }, [isRoomReserved]);

  // Chuyển đổi thời gian thành định dạng MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Kiểm tra định dạng email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Kiểm tra định dạng số điện thoại (ví dụ: 10 chữ số, bắt đầu bằng 0)
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Giả lập API thanh toán với kiểu trả về rõ ràng
  const processPayment = async (paymentData: any): Promise<PaymentResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, transactionId: "TX123456" });
      }, 2000);
    });
  };

  // Hàm xử lý đặt phòng
  const handleConfirmBooking = async () => {
    if (!isRoomReserved) {
      Alert.alert(
        "Phòng không còn được giữ",
        "Rất tiếc, phòng không còn được giữ. Vui lòng chọn phòng khác.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/home/trangchu"),
          },
        ]
      );
      return;
    }

    if (!customerName || !phoneNumber || !email) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ họ tên, số điện thoại và email.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không đúng định dạng.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại không đúng định dạng.");
      return;
    }

    if (!paymentMethod) {
      Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán.");
      return;
    }

    if (paymentMethod === "credit_card") {
      if (!cardNumber || !expiryDate || !cvv) {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin thẻ tín dụng.");
        return;
      }
      if (cardNumber.length !== 16 || cvv.length !== 3 || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        Alert.alert("Lỗi", "Thông tin thẻ tín dụng không hợp lệ.");
        return;
      }
    }

    if (paymentMethod === "digital_wallet" && !digitalWallet) {
      Alert.alert("Lỗi", "Vui lòng chọn ví điện tử.");
      return;
    }

    setIsLoading(true);

    try {
      let paymentResult: PaymentResult = { success: true, transactionId: null };
      if (paymentMethod !== "cash") {
        const paymentData = {
          amount: finalPrice,
          method: paymentMethod,
          cardNumber: paymentMethod === "credit_card" ? cardNumber : undefined,
          expiryDate: paymentMethod === "credit_card" ? expiryDate : undefined,
          cvv: paymentMethod === "credit_card" ? cvv : undefined,
          digitalWallet: paymentMethod === "digital_wallet" ? digitalWallet : undefined,
        };
        paymentResult = await processPayment(paymentData);
        if (!paymentResult.success) {
          throw new Error("Thanh toán thất bại. Vui lòng thử lại.");
        }
      }

      const bookingData = {
        MAKH: 11, // Cần lấy từ hệ thống (tạm để 11 như Postman)
        NgayDat: new Date().toISOString().split("T")[0], // Ngày hiện tại
        NgayNhan: checkInDate,
        NgayTra: checkOutDate,
        MaPhong: rooms[0].id, // Lấy mã phòng đầu tiên
        GhiChu: notes,
      };

      console.log("Dữ liệu gửi lên server:", bookingData);

      const res = await fetch("http://192.168.3.102:3001/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await res.json();
      console.log("Phản hồi từ server:", { status: res.status, body: result });

      if (!res.ok) {
        throw new Error(result?.message || "Đặt phòng thất bại. Vui lòng thử lại.");
      }

      await AsyncStorage.setItem("defaultPaymentMethod", paymentMethod);

      Alert.alert("Thành công", `Đặt phòng thành công! Mã đặt phòng: ${result.bookingID}`, [
        {
          text: "OK",
          onPress: () => router.replace("/home/trangchu"),
        },
      ]);
    } catch (err: any) {
      console.error("Booking error:", err);
      Alert.alert("Lỗi", err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Thông báo giữ phòng với đồng hồ đếm ngược */}
      {isRoomReserved && (
        <View style={styles.reservationNotice}>
          <Icon name="time-outline" size={20} color="#FF4500" />
          <Text style={styles.reservationText}>
            Chúng tôi đang giữ phòng cho bạn: <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollContainer}>
        {/* Khung: Thông tin đặt phòng */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thông tin đặt phòng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đặt:</Text>
            <Text style={styles.infoValue}>{checkInDate || "Chưa chọn"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày trả:</Text>
            <Text style={styles.infoValue}>{checkOutDate || "Chưa chọn"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số phòng:</Text>
            <Text style={styles.infoValue}>{rooms.length}</Text>
          </View>
          <View style={styles.roomListContainer}>
            <Text style={styles.infoLabel}>Danh sách phòng:</Text>
            <View style={styles.roomList}>
              {rooms.map((room, index) => (
                <Text key={index} style={styles.roomItem}>
                  - {room.name} (Tầng {room.floor}, {room.type}, {room.price.toLocaleString()} VNĐ/đêm)
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Khung: Thông tin giá */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thông tin giá</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng giá phòng:</Text>
            <Text style={styles.infoValue}>{totalPrice.toLocaleString()} VNĐ</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng giá dịch vụ:</Text>
            <Text style={styles.infoValue}>{totalServicePrice.toLocaleString()} VNĐ</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng giá cuối cùng:</Text>
            <Text style={styles.infoValue}>{finalPrice.toLocaleString()} VNĐ</Text>
          </View>
          {totalServicePrice > 0 && (
            <View style={styles.serviceListContainer}>
              <Text style={styles.infoLabel}>Dịch vụ đã chọn:</Text>
              <View style={styles.serviceList}>
                {Object.keys(selectedServices)
                  .filter((service) => selectedServices[service])
                  .map((service, index) => (
                    <Text key={index} style={styles.serviceItem}>
                      - {service}
                    </Text>
                  ))}
              </View>
            </View>
          )}
        </View>

        {/* Khung: Chọn phương thức thanh toán */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={styles.paymentMethodItem}
              onPress={() => setPaymentMethod(method.value)}
            >
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodText}>{method.label}</Text>
              </View>
              <Icon
                name={
                  paymentMethod === method.value
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={20}
                color={paymentMethod === method.value ? "#1E90FF" : "#666"}
              />
            </TouchableOpacity>
          ))}

          {/* Hiển thị chi tiết nếu chọn "Thẻ tín dụng" */}
          {paymentMethod === "credit_card" && (
            <View style={styles.paymentDetails}>
              <TextInput
                style={styles.input}
                placeholder="Số thẻ (16 chữ số) *"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={16}
              />
              <View style={styles.cardDetailsRow}>
                <TextInput
                  style={[styles.input, styles.cardDetailInput]}
                  placeholder="Ngày hết hạn (MM/YY) *"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.cardDetailInput]}
                  placeholder="CVV (3 chữ số) *"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          )}

          {/* Hiển thị danh sách ví nếu chọn "Ví điện tử" */}
          {paymentMethod === "digital_wallet" && (
            <View style={styles.paymentDetails}>
              {digitalWallets.map((wallet, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.paymentMethodItem}
                  onPress={() => setDigitalWallet(wallet.value)}
                >
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodText}>{wallet.label}</Text>
                  </View>
                  <Icon
                    name={
                      digitalWallet === wallet.value
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={digitalWallet === wallet.value ? "#1E90FF" : "#666"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Khung: Thông tin khách hàng */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên *"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại *"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Ghi chú (tùy chọn)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Footer với nút "Xác nhận đặt phòng" */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, (isLoading || !isRoomReserved) && styles.disabledButton]}
          onPress={handleConfirmBooking}
          disabled={isLoading || !isRoomReserved}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Xác nhận đặt phòng</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  reservationNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
  },
  reservationText: {
    fontSize: 16,
    color: "#FF4500",
    marginLeft: 10,
  },
  timerText: {
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  roomListContainer: {
    marginBottom: 10,
  },
  roomList: {
    marginTop: 5,
    marginLeft: 0,
  },
  roomItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    marginLeft: 0,
  },
  serviceListContainer: {
    marginBottom: 10,
  },
  serviceList: {
    marginTop: 5,
    marginLeft: 0,
  },
  serviceItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    marginLeft: 0,
  },
  paymentMethodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#333",
  },
  paymentDetails: {
    marginTop: 10,
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailInput: {
    flex: 1,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  confirmButton: {
    padding: 15,
    backgroundColor: "#8A2BE2",
    borderRadius: 5,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
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

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  maxPeople: number;
  floor: number;
  images: string[];
}

interface PaymentResult {
  success: boolean;
  transactionId: string | null;
}

export default function ConfirmBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rooms: Room[] = params.rooms ? JSON.parse(params.rooms as string) : [];
  const totalPrice = parseFloat(params.totalPrice as string) || 0;
  const totalServicePrice = parseFloat(params.totalServicePrice as string) || 0;
  const finalPrice = parseFloat(params.finalPrice as string) || 0;
  const checkInDate = params.checkInDate as string;
  const checkOutDate = params.checkOutDate as string;
  const selectedServices = params.selectedServices
    ? JSON.parse(params.selectedServices as string)
    : {};

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
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isRoomReserved, setIsRoomReserved] = useState<boolean>(true);

  const paymentMethods = [
    { label: "Tiền mặt", value: "cash" },
    { label: "Thẻ tín dụng", value: "credit_card" },
    { label: "Ví điện tử", value: "digital_wallet" },
  ];

  const digitalWallets = [
    { label: "MoMo", value: "momo" },
    { label: "ZaloPay", value: "zalopay" },
    { label: "VNPay", value: "vnpay" },
  ];

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

    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token khi vào màn hình:", token);
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt phòng.", [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      }
    };

    loadPaymentMethod();
    checkAuth();
  }, []);

  useEffect(() => {
    const checkRoomReservation = async () => {
      const isRoomTaken = false; // Thay bằng API kiểm tra phòng nếu cần
      if (isRoomTaken) {
        setIsRoomReserved(false);
        Alert.alert(
          "Phòng đã được đặt",
          "Rất tiếc, phòng đã được người khác đặt. Vui lòng chọn phòng khác.",
          [
            { text: "OK", onPress: () => router.replace("/home/timkiem") },
          ]
        );
        return;
      }
    };

    checkRoomReservation();

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
                { text: "OK", onPress: () => router.replace("/home/trangchu") },
              ]
            );
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoomReserved]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  const processPayment = async (paymentData: any): Promise<PaymentResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, transactionId: "TX123456" });
      }, 2000);
    });
  };

  const handleConfirmBooking = async () => {
    if (!isRoomReserved) {
      Alert.alert(
        "Phòng không còn được giữ",
        "Rất tiếc, phòng không còn được giữ. Vui lòng chọn phòng khác.",
        [
          { text: "OK", onPress: () => router.replace("/home/trangchu") },
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

      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để đặt phòng.");
      }

      const decodeJWT = (token: string): any => {
        try {
          const payload = token.split('.')[1];
          return JSON.parse(atob(payload));
        } catch (e) {
          throw new Error("Token không hợp lệ.");
        }
      };

      const decoded = decodeJWT(token);
      console.log("Decoded token:", decoded);
      const maKH = decoded.id; // Token chứa id thay vì MaKH

      if (!maKH) {
        throw new Error("Không tìm thấy ID người dùng trong token.");
      }

      // Gửi yêu cầu đặt phòng cho từng phòng
      const bookingPromises = rooms.map(async (room) => {
        const bookingData = {
          MaKH: maKH,
          NgayDat: new Date().toISOString().split("T")[0],
          NgayNhan: checkInDate,
          NgayTra: checkOutDate,
          MaPhong: room.id,
          GhiChu: notes,
        };

        console.log("Dữ liệu gửi lên server:", bookingData);

        const res = await fetch("http://192.168.1.134:3001/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        });

        const result = await res.json();
        console.log("Phản hồi từ server:", { status: res.status, body: result });

        if (!res.ok) {
          throw new Error(result?.message || `Đặt phòng ${room.name} thất bại.`);
        }
        return result;
      });

      const bookingResults = await Promise.all(bookingPromises);

      await AsyncStorage.setItem("defaultPaymentMethod", paymentMethod);

      Alert.alert(
        "Thành công",
        `Đặt phòng thành công! Mã đặt phòng: ${bookingResults.map((r) => r.bookingId).join(", ")}`,
        [
          { text: "OK", onPress: () => router.replace("/home/trangchu") },
        ]
      );
    } catch (err: any) {
      console.error("Booking error:", err);
      Alert.alert("Lỗi", err.message || "Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      {isRoomReserved && (
        <View style={styles.reservationNotice}>
          <Icon name="time-outline" size={20} color="#FF4500" />
          <Text style={styles.reservationText}>
            Chúng tôi đang giữ phòng cho bạn: <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollContainer}>
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
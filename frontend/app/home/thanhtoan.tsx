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
import { createHmacSignature } from "../../utils/hmac";

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
  message?: string;
}

interface PaymentData {
  bookingId?: string;
  amount: number;
  paymentAmount: number;
  change: number;
  paymentMethod: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  digitalWallet?: string;
  status: string;
  timestamp: string;
  transactionId?: string;
  signature: string;
  customerEmail?: string; // Thêm email khách hàng
}

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const finalPrice = parseFloat(params.finalPrice as string) || 0;
  const customerName = params.customerName as string;
  const phoneNumber = params.phoneNumber as string;
  const email = params.email as string;
  const notes = params.notes as string;
  const checkInDate = params.checkInDate as string;
  const checkOutDate = params.checkOutDate as string;
  const rooms: Room[] = params.rooms ? JSON.parse(params.rooms as string) : [];

  const TOTAL_TIME = 600; // 10 phút
  const SECRET_KEY = "06072004"; // Phải khớp với server

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [digitalWallet, setDigitalWallet] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const [isRoomReserved, setIsRoomReserved] = useState<boolean>(true);
  const [isTimeExpired, setIsTimeExpired] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    const initializeTimer = async () => {
      try {
        const startTimeStr = await AsyncStorage.getItem("reservationStartTime");
        const currentTime = Math.floor(Date.now() / 1000);

        if (startTimeStr) {
          const startTime = parseInt(startTimeStr, 10);
          const elapsedTime = currentTime - startTime;
          const remainingTime = TOTAL_TIME - elapsedTime;

          if (remainingTime > 0) {
            setTimeLeft(remainingTime);
            setIsRoomReserved(true);
          } else {
            await AsyncStorage.removeItem("reservationStartTime");
            setTimeLeft(TOTAL_TIME);
            setIsRoomReserved(false);
            setIsTimeExpired(true);
          }
        } else {
          await AsyncStorage.setItem("reservationStartTime", currentTime.toString());
          setTimeLeft(TOTAL_TIME);
          setIsRoomReserved(true);
        }
      } catch (err) {
        console.error("Error initializing timer:", err);
        setErrorMessage("Đã xảy ra lỗi khi khởi tạo bộ đếm. Vui lòng thử lại.");
      }
    };

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
      if (!token) {
        setErrorMessage("Vui lòng đăng nhập để thanh toán.");
        router.replace("/");
      }
    };

    initializeTimer();
    loadPaymentMethod();
    checkAuth();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          if (isRoomReserved) {
            setIsTimeExpired(true);
            setIsRoomReserved(false);
            AsyncStorage.removeItem("reservationStartTime");
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoomReserved]);

  useEffect(() => {
    if (isTimeExpired) {
      setErrorMessage("Thời gian giữ phòng đã hết. Vui lòng chọn lại phòng.");
      router.replace("/home/trangchu");
    }
  }, [isTimeExpired, router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để thanh toán.");
      }

      const res = await fetch("http://192.168.3.102:3001/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Payment-Signature": paymentData.signature,
        },
        body: JSON.stringify(paymentData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Thanh toán thất bại.");
      }

      return { success: true, transactionId: result.paymentId, message: result.message };
    } catch (error: any) {
      return { success: false, transactionId: null, message: error.message };
    }
  };

  const isFormValid = () => {
    if (!paymentMethod) return false;

    if (paymentMethod === "credit_card") {
      return (
        cardNumber.length === 16 &&
        cvv.length === 3 &&
        /^\d{2}\/\d{2}$/.test(expiryDate)
      );
    }

    if (paymentMethod === "digital_wallet") {
      return !!digitalWallet && parseFloat(paymentAmount || "0") >= finalPrice;
    }

    if (paymentMethod === "cash") {
      return parseFloat(paymentAmount || "0") >= finalPrice;
    }

    return true;
  };

  const handleConfirmPayment = async () => {
    setErrorMessage("");

    if (!isRoomReserved) {
      setErrorMessage("Rất tiếc, phòng không còn được giữ. Vui lòng chọn phòng khác.");
      router.replace("/home/trangchu");
      return;
    }

    if (!paymentMethod) {
      setErrorMessage("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    if (paymentMethod === "credit_card") {
      if (!cardNumber || !expiryDate || !cvv) {
        setErrorMessage("Vui lòng nhập đầy đủ thông tin thẻ tín dụng.");
        return;
      }
      if (cardNumber.length !== 16 || cvv.length !== 3 || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setErrorMessage("Thông tin thẻ tín dụng không hợp lệ.");
        return;
      }
    }

    if (paymentMethod === "digital_wallet" && !digitalWallet) {
      setErrorMessage("Vui lòng chọn ví điện tử.");
      return;
    }

    const paymentAmountNum = parseFloat(paymentAmount || "0");
    if ((paymentMethod === "cash" || paymentMethod === "digital_wallet") && paymentAmountNum < finalPrice) {
      setErrorMessage(`Số tiền thanh toán (${paymentAmountNum.toLocaleString()} VNĐ) không đủ. Vui lòng nhập ít nhất ${finalPrice.toLocaleString()} VNĐ.`);
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để đặt phòng.");
      }

      const decodeJWT = (token: string): any => {
        try {
          const payload = token.split(".")[1];
          return JSON.parse(atob(payload));
        } catch (e) {
          throw new Error("Token không hợp lệ.");
        }
      };

      const decoded = decodeJWT(token);
      const maKH = decoded.id;

      if (!maKH) {
        throw new Error("Không tìm thấy ID người dùng trong token.");
      }

      // Thực hiện đặt phòng
      const bookingPromises = rooms.map(async (room) => {
        const bookingData = {
          MaKH: maKH,
          NgayDat: new Date().toISOString().split("T")[0],
          NgayNhan: checkInDate,
          NgayTra: checkOutDate,
          MaPhong: room.id,
          GhiChu: notes,
        };

        const res = await fetch("http://192.168.3.102:3001/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || `Đặt phòng ${room.name} thất bại.`);
        }
        return result;
      });

      const bookingResults = await Promise.all(bookingPromises);

      // Kiểm tra bookingResults
      if (!bookingResults || bookingResults.length === 0 || !bookingResults[0].bookingId) {
        throw new Error("Không thể lấy mã đặt phòng. Vui lòng thử lại.");
      }

      // Tạo dữ liệu thanh toán
      const paymentAmountNum = paymentMethod === "credit_card" ? finalPrice : parseFloat(paymentAmount || "0");
      const change = paymentAmountNum - finalPrice;
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const transactionId = "TX" + Math.random().toString(36).substr(2, 9);

      const paymentData: PaymentData = {
        bookingId: bookingResults[0].bookingId,
        amount: finalPrice,
        paymentAmount: paymentAmountNum,
        change: change > 0 ? change : 0,
        paymentMethod: paymentMethod,
        cardNumber: paymentMethod === "credit_card" ? cardNumber : undefined,
        expiryDate: paymentMethod === "credit_card" ? expiryDate : undefined,
        cvv: paymentMethod === "credit_card" ? cvv : undefined,
        digitalWallet: paymentMethod === "digital_wallet" ? digitalWallet : undefined,
        status: "completed",
        timestamp,
        transactionId,
        customerEmail: email, // Thêm email khách hàng
        signature: "",
      };

      // Chỉ lấy các trường cần thiết để tạo chữ ký, đảm bảo ép kiểu thành string
      const dataToSign = {
        bookingId: String(paymentData.bookingId),
        amount: String(paymentData.amount),
        paymentAmount: String(paymentData.paymentAmount),
        change: String(paymentData.change),
        paymentMethod: String(paymentData.paymentMethod),
        status: String(paymentData.status),
        timestamp: String(paymentData.timestamp),
        transactionId: String(paymentData.transactionId),
      };

      paymentData.signature = createHmacSignature(dataToSign, SECRET_KEY);

      const paymentResult = await processPayment(paymentData);
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Thanh toán thất bại.");
      }

      await AsyncStorage.setItem("defaultPaymentMethod", paymentMethod);
      await AsyncStorage.removeItem("reservationStartTime");

      const successMessage =
        change > 0
          ? `Đặt phòng thành công! Mã đặt phòng: ${bookingResults.map((r) => r.bookingId).join(", ")}. Số tiền thừa: ${change.toLocaleString()} VNĐ sẽ được hoàn lại qua ${paymentMethod === "cash" ? "tiền mặt" : "chuyển khoản"}.`
          : `Đặt phòng thành công! Mã đặt phòng: ${bookingResults.map((r) => r.bookingId).join(", ")}.`;

      Alert.alert("Thành công", successMessage, [
        { text: "OK", onPress: () => router.replace("/home/trangchu") },
      ]);
    } catch (err: any) {
      console.error("Payment/Booking error:", err);
      setErrorMessage(err.message || "Đã xảy ra lỗi khi thanh toán hoặc đặt phòng. Vui lòng thử lại.");
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
        <Text style={styles.headerTitle}>Thanh toán</Text>
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
          <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng tiền:</Text>
            <Text style={styles.infoValue}>{finalPrice.toLocaleString()} VNĐ</Text>
          </View>
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
                name={paymentMethod === method.value ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={paymentMethod === method.value ? "#1E90FF" : "#666"}
              />
            </TouchableOpacity>
          ))}

          {(paymentMethod === "cash" || paymentMethod === "digital_wallet") && (
            <View style={styles.paymentDetails}>
              <TextInput
                style={styles.input}
                placeholder={`Số tiền thanh toán (tối thiểu ${finalPrice.toLocaleString()} VNĐ) *`}
                value={paymentAmount}
                onChangeText={(text) => {
                  setPaymentAmount(text);
                  setErrorMessage("");
                }}
                keyboardType="numeric"
              />
            </View>
          )}

          {paymentMethod === "credit_card" && (
            <View style={styles.paymentDetails}>
              <TextInput
                style={styles.input}
                placeholder="Số thẻ (16 chữ số) *"
                value={cardNumber}
                onChangeText={(text) => {
                  setCardNumber(text);
                  setErrorMessage("");
                }}
                keyboardType="numeric"
                maxLength={16}
              />
              <View style={styles.cardDetailsRow}>
                <TextInput
                  style={[styles.input, styles.cardDetailInput]}
                  placeholder="Ngày hết hạn (MM/YY) *"
                  value={expiryDate}
                  onChangeText={(text) => {
                    setExpiryDate(text);
                    setErrorMessage("");
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.cardDetailInput]}
                  placeholder="CVV (3 chữ số) *"
                  value={cvv}
                  onChangeText={(text) => {
                    setCvv(text);
                    setErrorMessage("");
                  }}
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
                    name={digitalWallet === wallet.value ? "checkmark-circle" : "ellipse-outline"}
                    size={20}
                    color={digitalWallet === wallet.value ? "#1E90FF" : "#666"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, (!isFormValid() || isLoading) && styles.disabledButton]}
          onPress={handleConfirmPayment}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
});
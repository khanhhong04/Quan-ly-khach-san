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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token khi vào màn hình:", token);
      if (!token) {
        setErrorMessage("Vui lòng đăng nhập để đặt phòng.");
        router.replace("/");
      }
    };

    checkAuth();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  const isFormValid = () => {
    return customerName.trim() !== "" && validatePhoneNumber(phoneNumber) && validateEmail(email);
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    setErrorMessage("");
    if (text && !validatePhoneNumber(text)) {
      setPhoneError("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số");
    } else {
      setPhoneError("");
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setErrorMessage("");
    if (text && !validateEmail(text)) {
      setEmailError("Email không đúng định dạng");
    } else {
      setEmailError("");
    }
  };

  const handleConfirmBooking = async () => {
    setErrorMessage("");

    if (!customerName || !phoneNumber || !email) {
      setErrorMessage("Vui lòng nhập đầy đủ họ tên, số điện thoại và email.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Email không đúng định dạng.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("Số điện thoại không đúng định dạng.");
      return;
    }

    // Thêm thông báo và log khi đặt nhiều phòng
    if (rooms.length >= 2) {
      console.log("Bạn đã đặt nhiều phòng:", rooms.map((room) => room.name).join(", "));
      Alert.alert("Thông báo", "Bạn đã đặt nhiều phòng: " + rooms.map((room) => room.name).join(", "));
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để đặt phòng.");
      }

      router.push({
        pathname: "/home/thanhtoan",
        params: {
          finalPrice: finalPrice.toString(),
          customerName,
          phoneNumber,
          email,
          notes,
          checkInDate,
          checkOutDate,
          rooms: JSON.stringify(rooms),
          timeLeft: "600",
        },
      });
    } catch (err: any) {
      console.error("Error:", err);
      setErrorMessage(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
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
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên *"
            value={customerName}
            onChangeText={(text) => {
              setCustomerName(text);
              setErrorMessage("");
            }}
          />
          <TextInput
            style={[styles.input, phoneError && styles.inputError]}
            placeholder="Số điện thoại *"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Email *"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Ghi chú (tùy chọn)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, (!isFormValid() || isLoading) && styles.disabledButton]}
          onPress={handleConfirmBooking}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});
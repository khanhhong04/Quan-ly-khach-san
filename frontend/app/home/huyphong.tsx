import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Định nghĩa interface cho đặt phòng
interface Booking {
  MaDatPhong: string;
  MaKH: number;
  NgayDat: string;
  NgayNhan: string;
  NgayTra: string;
  TrangThai: string;
  GhiChu: string | null;
  MaPhong: number;
  TenPhong?: string;
}

export default function CancelBooking() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCanceling, setIsCanceling] = useState<string | null>(null);

  // Lấy MaKH từ AsyncStorage và lấy danh sách đặt phòng
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        // Lấy MaKH từ AsyncStorage
        const userData = await AsyncStorage.getItem("user");
        console.log("User data from AsyncStorage:", userData);
        if (!userData) {
          Alert.alert("Lỗi", "Vui lòng đăng nhập để xem danh sách đặt phòng.", [
            { text: "OK", onPress: () => router.replace("/dangnhap") },
          ]);
          return;
        }

        const user = JSON.parse(userData);
        console.log("Parsed user:", user);
        const MaKH = user.MaKH;
        console.log("MaKH:", MaKH);

        if (!MaKH) {
          throw new Error("Không tìm thấy mã khách hàng.");
        }

        // Gọi API để lấy danh sách đặt phòng
        const res = await fetch(
          `http://192.168.1.134:3001/api/bookings?MaKH=${MaKH}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await res.json();
        console.log("API response:", result);
        if (!res.ok) {
          throw new Error(result.message || "Không thể tải danh sách đặt phòng.");
        }

        setBookings(result);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        Alert.alert(
          "Lỗi",
          err.message || "Đã xảy ra lỗi khi tải danh sách đặt phòng.",
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Xử lý hủy đặt phòng
  const handleCancelBooking = async (MaDatPhong: string) => {
    setIsCanceling(MaDatPhong);
    try {
      const res = await fetch(
        `http://192.168.1.134:3001/api/bookings/${MaDatPhong}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Hủy đặt phòng thất bại. Vui lòng thử lại.");
      }

      // Cập nhật danh sách đặt phòng sau khi hủy
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.MaDatPhong !== MaDatPhong)
      );

      Alert.alert("Thành công", "Hủy đặt phòng thành công!", [
        { text: "OK" },
      ]);
    } catch (err: any) {
      console.error("Error canceling booking:", err);
      Alert.alert(
        "Lỗi",
        err.message || "Đã xảy ra lỗi khi hủy đặt phòng. Vui lòng thử lại.",
        [{ text: "OK" }]
      );
    } finally {
      setIsCanceling(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hủy đặt phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Danh sách đặt phòng */}
      <ScrollView style={styles.scrollContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#8A2BE2" style={styles.loader} />
        ) : bookings.length === 0 ? (
          <Text style={styles.noBookings}>Không có đặt phòng nào.</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.MaDatPhong} style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>Phòng {booking.MaPhong} - {booking.TenPhong || "Không xác định"}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày đặt:</Text>
                <Text style={styles.infoValue}>{booking.NgayDat}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày nhận:</Text>
                <Text style={styles.infoValue}>{booking.NgayNhan}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày trả:</Text>
                <Text style={styles.infoValue}>{booking.NgayTra}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <Text style={[styles.infoValue, { color: booking.TrangThai === "DA_HUY" ? "#FF4500" : "#1E90FF" }]}>
                  {booking.TrangThai === "DA_HUY" ? "Đã hủy" : "Đã thuê"}
                </Text>
              </View>
              {booking.GhiChu && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ghi chú:</Text>
                  <Text style={styles.infoValue}>{booking.GhiChu}</Text>
                </View>
              )}
              {booking.TrangThai !== "DA_HUY" && (
                <TouchableOpacity
                  style={[styles.cancelButton, isCanceling === booking.MaDatPhong && styles.disabledButton]}
                  onPress={() => handleCancelBooking(booking.MaDatPhong)}
                  disabled={isCanceling === booking.MaDatPhong}
                >
                  {isCanceling === booking.MaDatPhong ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.cancelButtonText}>Hủy đặt phòng</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
  loader: {
    marginTop: 20,
  },
  noBookings: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  bookingCard: {
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
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FF4500",
    borderRadius: 5,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
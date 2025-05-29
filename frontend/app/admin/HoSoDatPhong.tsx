import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Booking {
  MaDatPhong: number;
  ten: string;
  sdt: string;
  phong: string;
  gia: string;
  ngayVao: string;
  ngayTra: string;
  ngayDat: string;
  thoiGianConLai: string;
  datPhongId: number;
  TrangThai: string;
}

const HoSoDatPhong = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setError("Không tìm thấy token đăng nhập. Vui lòng đăng nhập.");
          return;
        }

        const response = await fetch("http://192.168.1.134:3001/api/bookings/all", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Phản hồi API không thành công: ${response.status}`);
        }

        const data = await response.json();
        console.log("All bookings API response:", data);

        if (data.bookings && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setError("Không có dữ liệu đặt phòng nào được trả về.");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đặt phòng:", error);
        setError("Không thể lấy dữ liệu đặt phòng: " + error.message);
      }
    };

    fetchAllBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) =>
    booking.datPhongId.toString().includes(searchQuery) ||
    booking.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.sdt.includes(searchQuery)
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Đã Thuê":
        return { backgroundColor: "#d4edda", color: "#155724" };
      case "Đã Thanh Toán":
        return { backgroundColor: "#d1ecf1", color: "#0c5460" };
      case "Đã Hủy":
        return { backgroundColor: "#f8d7da", color: "#721c24" };
      default:
        return { backgroundColor: "#f0f0f0", color: "#333" };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HỒ SƠ ĐẶT PHÒNG</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Nhập để tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>#</Text>
        <Text style={styles.headerCell}>KHÁCH HÀNG</Text>
        <Text style={styles.headerCell}>PHÒNG</Text>
        <Text style={styles.headerCell}>CHI TIẾT PHÒNG ĐẶT</Text>
        <Text style={styles.headerCell}>TRẠNG THÁI</Text>
      </View>

      {filteredBookings.length === 0 ? (
        <Text style={styles.noDataText}>Không có dữ liệu để hiển thị.</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.MaDatPhong.toString()}
          renderItem={({ item, index }) => {
            const statusStyle = getStatusStyle(item.TrangThai);
            return (
              <View style={styles.row}>
                <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
                <View style={styles.cell}>
                  <Text>ID Đặt Phòng: {item.datPhongId}</Text>
                  <Text>Tên: {item.ten}</Text>
                  <Text>Điện Thoại: {item.sdt}</Text>
                </View>
                <View style={styles.cell}>
                  <Text>Phòng: {item.phong}</Text>
                  <Text>Giá: {parseFloat(item.gia).toLocaleString()} vnd</Text>
                </View>
                <View style={styles.cell}>
                  <Text>Ngày Bắt Đầu: {item.ngayVao}</Text>
                  <Text>Ngày Trả: {item.ngayTra}</Text>
                </View>
                <View style={[styles.cell, styles.statusCell, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={{ color: statusStyle.color, fontWeight: "bold", textAlign: "center" }}>{item.TrangThai}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerCell: { flex: 1, fontWeight: "bold", fontSize: 12 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 8,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    justifyContent: "center",
  },
  statusCell: {
    borderRadius: 4,
    padding: 4,
  },
  errorText: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default HoSoDatPhong;
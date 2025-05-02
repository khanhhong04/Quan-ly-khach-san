import React from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";

const bookingRecords = [
  {
    id: "956678926",
    name: "Quang Huy",
    phone: "0888131067",
    room: "Phòng Bình Dân",
    price: 800000,
    checkIn: "19-05-2023",
    checkOut: "20-05-2023",
    status: "Đã Xác Nhận Đặt Phòng",
  },
  {
    id: "934345445",
    name: "Quang Huy",
    phone: "0888131067",
    room: "Phòng Vip 3",
    price: 1500000,
    checkIn: "14-05-2023",
    checkOut: "17-05-2023",
    status: "Đã Thanh Toán",
  },
  {
    id: "83178374",
    name: "Quang Huy",
    phone: "0888131067",
    room: "Phòng Vip 3",
    price: 4500000,
    checkIn: "14-05-2023",
    checkOut: "20-05-2023",
    status: "Đã Hủy",
  },
  {
    id: "56827592",
    name: "Quang Huy",
    phone: "0888131067",
    room: "Phòng Bình Dân",
    price: 800000,
    checkIn: "14-05-2023",
    checkOut: "20-05-2023",
    status: "Đã Hủy",
  },
  {
    id: "39505733",
    name: "Quang Huy",
    phone: "0888131067",
    room: "Phòng Vip 3",
    price: 0,
    checkIn: "14-05-2023",
    checkOut: "20-05-2023",
    status: "Đã Hủy",
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Đã Xác Nhận Đặt Phòng":
      return { backgroundColor: "#d4edda", color: "#155724" };
    case "Đã Thanh Toán":
      return { backgroundColor: "#d1ecf1", color: "#0c5460" };
    case "Đã Hủy":
      return { backgroundColor: "#f8d7da", color: "#721c24" };
    default:
      return { backgroundColor: "#f0f0f0", color: "#333" };
  }
};

const HoSoDatPhong = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HỒ SƠ ĐẶT PHÒNG</Text>
      <TextInput style={styles.searchInput} placeholder="Nhập để tìm kiếm..." />

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>#</Text>
        <Text style={styles.headerCell}>KHÁCH HÀNG</Text>
        <Text style={styles.headerCell}>PHÒNG</Text>
        <Text style={styles.headerCell}>CHI TIẾT PHÒNG ĐẶT</Text>
        <Text style={styles.headerCell}>TRẠNG THÁI</Text>
      </View>

      <FlatList
        data={bookingRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const statusStyle = getStatusStyle(item.status);
          return (
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
              <View style={styles.cell}>
                <Text>ID Đặt Phòng: {item.id}</Text>
                <Text>Tên: {item.name}</Text>
                <Text>Điện Thoại: {item.phone}</Text>
              </View>
              <View style={styles.cell}>
                <Text>Phòng: {item.room}</Text>
                <Text>Giá: {item.price.toLocaleString()} vnd</Text>
              </View>
              <View style={styles.cell}>
                <Text>Ngày Bắt Đầu: {item.checkIn}</Text>
                <Text>Ngày Trả: {item.checkOut}</Text>
              </View>
              <View style={[styles.cell, styles.statusCell, { backgroundColor: statusStyle.backgroundColor }]}>
                <Text style={{ color: statusStyle.color, fontWeight: "bold", textAlign: "center" }}>{item.status}</Text>
              </View>
            </View>
          );
        }}
      />
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
});

export default HoSoDatPhong;

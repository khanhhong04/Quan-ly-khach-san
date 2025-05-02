import React from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

const bookingData = [
  {
    id: "956639926",
    name: "Quang Huy",
    phone: "0888131067",
    room: "Phòng Đơn",
    price: 500000,
    checkIn: "15-05-2023",
    checkOut: "20-05-2023",
  },
  {
    id: "956638926",
    name: "Quang Huy",
    phone: "0888131067",
    room: "Phòng Đơn",
    price: 250000,
    checkIn: "15-05-2023",
    checkOut: "20-05-2023",
  },
];

const XacNhanThanhToan = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PHÒNG MỚI ĐẶT</Text>
      <TextInput style={styles.searchInput} placeholder="Nhập để tìm kiếm..." />

      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>#</Text>
        <Text style={styles.headerText}>THÔNG TIN KHÁCH HÀNG</Text>
        <Text style={styles.headerText}>PHÒNG</Text>
        <Text style={styles.headerText}>THÔNG TIN PHÒNG ĐẶT</Text>
        <Text style={styles.headerText}>HÀNH ĐỘNG</Text>
      </View>

      {bookingData.map((item, index) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.cell}>{index + 1}</Text>
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
            <Text>Ngày Vào: {item.checkIn}</Text>
            <Text>Ngày Trả: {item.checkOut}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.confirmBtn}>
              <Text style={styles.btnText}>Xác Nhận Đặt Phòng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn}>
              <Text style={styles.btnText}>Hủy Đặt Phòng</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: "#f1f1f1",
    padding: 8,
  },
  headerText: { flex: 1, fontWeight: "bold", fontSize: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cell: { flex: 1, fontSize: 12 },
  actions: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  confirmBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default XacNhanThanhToan;

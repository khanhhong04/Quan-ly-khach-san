// components/admin/PhongMoiDat.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const sampleData = [
  {
    id: '1',
    datPhongId: '956678926',
    ten: 'Quang Huy',
    sdt: '0888131067',
    phong: 'Phòng Vip 3',
    gia: 1500000,
    ngayVao: '10-05-2023',
    ngayTra: '14-05-2023',
    thoiGianConLai: '6 ngày',
  },
  {
    id: '2',
    datPhongId: '956678927',
    ten: 'Quang Huy',
    sdt: '0888131067',
    phong: 'Phòng Bình Dân',
    gia: 4800000,
    ngayVao: '19-05-2023',
    ngayTra: '25-05-2023',
    thoiGianConLai: '6 ngày',
  },
];

const PhongMoiDat: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>THANH TOÁN TRẢ PHÒNG</Text>
      <TextInput style={styles.searchInput} placeholder="Nhập để tìm kiếm..." />
      <ScrollView style={styles.table}>
        {sampleData.map((item, index) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.cell}>{index + 1}</Text>
            <View style={styles.cellInfo}>
              <Text>ID Đặt Phòng: {item.datPhongId}</Text>
              <Text>Tên: {item.ten}</Text>
              <Text>Điện Thoại: {item.sdt}</Text>
            </View>
            <View style={styles.cellInfo}>
              <Text>Phòng: {item.phong}</Text>
              <Text>Giá: {item.gia.toLocaleString()} vnd</Text>
            </View>
            <View style={styles.cellInfo}>
              <Text>Ngày Vào: {item.ngayVao}</Text>
              <Text>Ngày Trả: {item.ngayTra}</Text>
              <Text>Thời Gian Còn Lại: {item.thoiGianConLai}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#27ae60' }]}>
                <Text style={styles.buttonText}>Xác Nhận Thanh Toán</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]}>
                <Text style={styles.buttonText}>Hủy Bỏ Phòng</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  table: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
  },
  cell: {
    width: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cellInfo: {
    flex: 1,
    paddingHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginVertical: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PhongMoiDat;

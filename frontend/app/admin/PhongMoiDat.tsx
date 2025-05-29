import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

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
}

const PhongMoiDat: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookedRooms = async () => {
      try {
        const response = await fetch('http://192.168.1.134:3001/api/bookings/booked-rooms');
        if (!response.ok) {
          throw new Error('Phản hồi API không thành công');
        }
        const data = await response.json();
        console.log('Booked rooms API response:', data);
        setBookings(data.bookings || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng đã đặt:', error);
      }
    };

    fetchBookedRooms();
  }, []);

  const filteredBookings = bookings.filter(booking =>
    booking.datPhongId.toString().includes(searchQuery) ||
    booking.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.sdt.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PHÒNG MỚI ĐẶT</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Nhập để tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <ScrollView style={styles.table}>
        {filteredBookings.map((item, index) => (
          <View key={item.MaDatPhong.toString()} style={styles.row}>
            <Text style={styles.cell}>{index + 1}</Text>
            <View style={styles.cellInfo}>
              <Text>ID Đặt Phòng: {item.datPhongId}</Text>
              <Text>Tên: {item.ten}</Text>
              <Text>Điện Thoại: {item.sdt}</Text>
            </View>
            <View style={styles.cellInfo}>
              <Text>Phòng: {item.phong}</Text>
              <Text>Giá: {parseFloat(item.gia).toLocaleString()} vnd</Text>
            </View>
            <View style={styles.cellInfo}>
              <Text>Ngày Vào: {item.ngayVao}</Text>
              <Text>Ngày Trả: {item.ngayTra}</Text>
              <Text>Thời Gian Còn Lại: {item.thoiGianConLai}</Text>
              <Text>Ngày Đặt: {item.ngayDat}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#27ae60' }]}>
                <Text style={styles.buttonText}>Xác Nhận Đặt phòng</Text>
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
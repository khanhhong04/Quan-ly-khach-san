import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
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
  thoiGian: string;
  datPhongId: number;
  TrangThai?: 'DA_THUE' | 'DANG_SU_DUNG' | 'TRONG' | 'DA_HUY' | 'DA_THANH_TOAN' | 'CHO_XU_LY_HUY';
}

const XacNhanThanhToan: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchPaidBookings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken'); // Thay localStorage bằng AsyncStorage
      console.log('Fetch token:', token);
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại!');
        router.push('/');
        return;
      }
      const response = await fetch('http://192.168.1.134:3001/api/bookings/paid-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Phản hồi API không thành công');
      }
      const data = await response.json();
      console.log('Paid bookings API response:', data);
      setBookings(data.bookings || []);
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách phòng:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidBookings();
  }, []);

  const filteredBookings = bookings.filter((booking: Booking) =>
    booking.datPhongId.toString().includes(searchQuery) ||
    booking.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.sdt.includes(searchQuery)
  );

  const approveCancellation = async (bookingId: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      const user = userInfo ? JSON.parse(userInfo) : null;
      console.log('Token:', token);
      console.log('User info:', user);

      if (!token || !user || user.RoleID !== 3) {
        Alert.alert('Lỗi', 'Chỉ admin mới có quyền phê duyệt hủy phòng!');
        return;
      }

      console.log('Approving cancellation for bookingId:', bookingId);
      const response = await fetch(`http://192.168.1.134:3001/api/bookings/${bookingId}/approve-cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);
      if (response.ok) {
        Alert.alert('Thành công', 'Phê duyệt hủy phòng thành công');
        fetchPaidBookings();
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể phê duyệt hủy phòng');
      }
    } catch (error: any) {
      console.error('Lỗi khi phê duyệt hủy phòng:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi phê duyệt hủy phòng');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token:', token);
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại!');
        router.push('/');
        return;
      }
      console.log('Canceling booking for bookingId:', bookingId);
      const response = await fetch(`http://192.168.1.134:3001/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Thành công', 'Yêu cầu hủy phòng đã được gửi, chờ phê duyệt');
        fetchPaidBookings();
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể gửi yêu cầu hủy phòng');
      }
    } catch (error: any) {
      console.error('Lỗi khi gửi yêu cầu hủy phòng:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi gửi yêu cầu hủy phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userInfo');
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>QUẢN LÝ ĐẶT PHÒNG</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Nhập để tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : (
        <ScrollView style={styles.table}>
          {filteredBookings.length === 0 ? (
            <Text style={styles.emptyText}>Không có đặt phòng nào để hiển thị.</Text>
          ) : (
            filteredBookings.map((item: Booking, index: number) => {
              console.log('Booking item:', item);
              return (
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
                    <Text>Ngày Đặt: {item.ngayDat}</Text>
                    <Text>Thời Gian Còn Lại: {item.thoiGianConLai}</Text>
                    <Text>Trạng Thái: {item.TrangThai === 'DA_THANH_TOAN' ? 'Đã Thanh Toán' : item.TrangThai === 'CHO_XU_LY_HUY' ? 'Chờ Xử Lý Hủy' : item.TrangThai}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    {item.TrangThai === 'CHO_XU_LY_HUY' ? (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#27ae60' }]}
                        onPress={() => {
                          console.log('Bấm nút Phê Duyệt Hủy cho ID:', item.datPhongId);
                          approveCancellation(item.datPhongId);
                        }}
                        disabled={loading}
                      >
                        <Text style={styles.buttonText}>Phê Duyệt Hủy</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#27ae60' }]}
                        disabled={true}
                      >
                        <Text style={styles.buttonText}>Xác Nhận Thanh Toán</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#e74c3c' }]}
                      onPress={() => {
                        console.log('Bấm nút Hủy Bỏ Phòng cho ID:', item.datPhongId);
                        cancelBooking(item.datPhongId);
                      }}
                      disabled={item.TrangThai === 'CHO_XU_LY_HUY' || loading}
                    >
                      <Text style={styles.buttonText}>Hủy Bỏ Phòng</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
});

export default XacNhanThanhToan;
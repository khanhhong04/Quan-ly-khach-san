import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://192.168.1.134:3001/api';

interface Booking {
  MaDatPhong: number;
  MaKH: number;
  NgayDat: string;
  NgayNhan: string;
  NgayTra: string;
  MaPhong: string;
  TenPhong?: string;
  TrangThai: 'DA_THUE' | 'DANG_SU_DUNG' | 'TRONG' | 'DA_HUY' | 'DA_THANH_TOAN' | 'CHO_XU_LY_HUY';
  GhiChu?: string;
}

type RootParamList = {
  Login: undefined;
  HuyPhong: undefined;
};

const HuyPhongScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (!token || !userInfo) {
          Alert.alert('Lỗi', 'Vui lòng đăng nhập lại', [
            { text: 'OK', onPress: () => navigation.replace('Login') },
          ]);
          return;
        }

        const user = JSON.parse(userInfo);
        setUserId(user.id);

        const response = await fetch(`${API_URL}/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();
        console.log('Phản hồi API bookings:', result);

        if (response.ok) {
          setBookings(result.bookings || []);
        } else {
          Alert.alert('Lỗi', result.message || 'Không thể tải danh sách đặt phòng');
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách đặt phòng:', error);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải danh sách đặt phòng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBookings();
  }, [navigation]);

  const cancelBooking = async (bookingId: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      const booking = bookings.find((b) => b.MaDatPhong === bookingId);
      const isPaid = booking?.TrangThai === 'DA_THANH_TOAN';

      const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log('Phản hồi API cancel:', { bookingId, result });

      if (response.ok) {
        if (isPaid) {
          console.log("Hủy phòng thành công (đã thanh toán). Mã đặt phòng:", bookingId, "- Thông báo hoàn tiền sẽ được gửi qua email.");
          Alert.alert("Thành công", "Hủy phòng thành công! Thông báo hoàn tiền sẽ được gửi qua email.");
        } else {
          console.log("Hủy phòng thành công, đang chờ phê duyệt từ admin. Mã đặt phòng:", bookingId);
          Alert.alert('Thành công', 'Yêu cầu hủy đặt phòng đã được gửi, chờ phê duyệt từ admin');
        }
        setBookings((prev) =>
          prev.map((booking) =>
            booking.MaDatPhong === bookingId
              ? { ...booking, TrangThai: 'CHO_XU_LY_HUY' }
              : booking
          )
        );
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể hủy đặt phòng');
      }
    } catch (error) {
      console.error('Lỗi khi hủy phòng:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi hủy phòng');
    }
  };

  const createMoMoPayment = async (bookingId: number): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thanh toán.');
      }

      const res = await fetch(`${API_URL}/payments/create_momo_payment_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Không thể tạo URL thanh toán MoMo.');
      }
      console.log('MoMo Payment URL:', result.paymentUrl);
      return result.paymentUrl;
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Lỗi khi tạo URL thanh toán MoMo.');
      return null;
    }
  };

  const handlePayment = async (bookingId: number) => {
    const paymentUrl = await createMoMoPayment(bookingId);
    if (paymentUrl) {
      await Linking.openURL(paymentUrl);
      await AsyncStorage.setItem('lastBookingId', bookingId.toString());
    }
  };

  const confirmCancel = (bookingId: number) => {
    const currentDate = new Date();
    const booking = bookings.find((b) => b.MaDatPhong === bookingId);
    if (booking) {
      const checkInDate = new Date(booking.NgayNhan);
      if (checkInDate <= currentDate) {
        console.log("Không thể hủy đặt phòng vì đã đến ngày check-in. Mã đặt phòng:", bookingId); // Thêm log
        Alert.alert('Lỗi', 'Không thể hủy đặt phòng vì đã đến ngày check-in.');
        return;
      }
    }

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy đặt phòng này? Yêu cầu sẽ được gửi đến admin để phê duyệt.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => cancelBooking(bookingId),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const canCancel = item.TrangThai === 'DA_THUE' || item.TrangThai === 'DANG_SU_DUNG' || item.TrangThai === 'DA_THANH_TOAN';
    const canPay = item.TrangThai === 'DA_THUE';
    return (
      <View style={styles.bookingItem}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingText}>Mã đặt phòng: {item.MaDatPhong}</Text>
          <Text style={styles.bookingText}>Phòng: {item.TenPhong || item.MaPhong}</Text>
          <Text style={styles.bookingText}>
            Ngày nhận: {new Date(item.NgayNhan).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.bookingText}>
            Ngày trả: {new Date(item.NgayTra).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.bookingText}>
            Trạng thái: {item.TrangThai === 'DA_THUE' ? 'Đã Thuê' : 
                        item.TrangThai === 'DANG_SU_DUNG' ? 'Đang Sử Dụng' : 
                        item.TrangThai === 'TRONG' ? 'Trống' : 
                        item.TrangThai === 'DA_HUY' ? 'Đã Hủy' : 
                        item.TrangThai === 'DA_THANH_TOAN' ? 'Đã Thanh Toán' : 
                        item.TrangThai === 'CHO_XU_LY_HUY' ? 'Chờ Xử Lý Hủy' : 
                        item.TrangThai}
          </Text>
          {item.GhiChu && <Text style={styles.bookingText}>Ghi chú: {item.GhiChu}</Text>}
        </View>
        <View style={styles.buttonContainer}>
          {canPay && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => handlePayment(item.MaDatPhong)}
            >
              <Text style={styles.payButtonText}>Chờ thanh toán</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => confirmCancel(item.MaDatPhong)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông Tin Đặt Phòng</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : bookings.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có đặt phòng nào.</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.MaDatPhong.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

export default HuyPhongScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    padding: 16,
  },
  bookingItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  buttonContainer: {
    justifyContent: 'space-between',
  },
  payButton: {
    backgroundColor: '#FFA500',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
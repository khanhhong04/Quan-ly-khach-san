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
  TrangThai: 'DA_THUE' | 'DANG_SU_DUNG' | 'TRONG' | 'DA_HUY';
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
        Alert.alert('Thành công', 'Hủy đặt phòng thành công');
        setBookings((prev) =>
          prev.map((booking) =>
            booking.MaDatPhong === bookingId
              ? { ...booking, TrangThai: 'DA_HUY' }
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

  const confirmCancel = (bookingId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy đặt phòng này?',
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
    const canCancel = item.TrangThai === 'DA_THUE' || item.TrangThai === 'DANG_SU_DUNG';
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
            Trạng thái: {item.TrangThai === 'DA_THUE' ? 'Đã thuê' : 
                        item.TrangThai === 'DANG_SU_DUNG' ? 'Đang sử dụng' : 
                        item.TrangThai === 'TRONG' ? 'Trống' : 'Đã hủy'}
          </Text>
          {item.GhiChu && <Text style={styles.bookingText}>Ghi chú: {item.GhiChu}</Text>}
        </View>
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => confirmCancel(item.MaDatPhong)}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>Hủy Đặt Phòng</Text>
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
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HuyPhongScreen;
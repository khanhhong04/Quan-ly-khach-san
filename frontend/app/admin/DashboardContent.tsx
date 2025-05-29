import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DashboardData {
  loaiPhong: number;
  tongPhong: number;
  khachMoi: number;
  phongDaDat: number;
  phongDaHuy: number;
  phongTrong: number;
  khachDangKy: number;
  phanHoi: number;
  doanhThu: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <Text style={styles.title}>{title}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
  </View>
);

const DashboardContent: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    loaiPhong: 5,
    tongPhong: 50,
    khachMoi: 12,
    phongDaDat: 20,
    phongDaHuy: 0,
    phongTrong: 23,
    khachDangKy: 0,
    phanHoi: 0,
    doanhThu: 50000000,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.error("Không tìm thấy token đăng nhập.");
          return;
        }

        // Lấy dữ liệu phòng từ API /api/rooms/stats
        const fetchRoomStats = async () => {
          const response = await fetch('http://192.168.1.134:3001/api/rooms/stats', {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Phản hồi API không thành công');
          const stats = await response.json();
          setData(prevData => ({
            ...prevData,
            loaiPhong: stats.loaiPhong || prevData.loaiPhong,
            tongPhong: stats.tongPhong || prevData.tongPhong,
            phongTrong: stats.phongTrong || prevData.phongTrong,
          }));
        };

        // Lấy số lượng phòng đã đặt từ API /api/bookings/stats/booked
        const fetchBookedRoomsCount = async () => {
          const response = await fetch('http://192.168.1.134:3001/api/bookings/stats/booked', {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Phản hồi API không thành công');
          const stats = await response.json();
          setData(prevData => ({
            ...prevData,
            phongDaDat: stats.phongDaDat || prevData.phongDaDat,
          }));
        };

        // Lấy số lượng phòng đã hủy từ API /api/bookings/stats/cancelled
        const fetchCancelledRoomsCount = async () => {
          const response = await fetch('http://192.168.1.134:3001/api/bookings/stats/cancelled', {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Phản hồi API không thành công');
          const stats = await response.json();
          setData(prevData => ({
            ...prevData,
            phongDaHuy: stats.phongDaHuy || prevData.phongDaHuy,
          }));
        };

        // Lấy tổng số khách hàng đăng ký từ API /api/auth/total-users
        const fetchRegisteredUsersCount = async () => {
          const response = await fetch('http://192.168.1.134:3001/api/auth/total-users', {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Phản hồi API không thành công');
          const stats = await response.json();
          setData(prevData => ({
            ...prevData,
            khachDangKy: stats.khachDangKy || prevData.khachDangKy,
          }));
        };

        // Lấy tổng doanh thu từ API /api/payments/total-revenue
        const fetchTotalRevenue = async () => {
          const response = await fetch('http://192.168.1.134:3001/api/payments/total-revenue', {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Phản hồi API không thành công');
          const stats = await response.json();
          setData(prevData => ({
            ...prevData,
            doanhThu: stats.totalRevenue || prevData.doanhThu,
          }));
        };

        await Promise.all([
          fetchRoomStats(),
          fetchBookedRoomsCount(),
          fetchCancelledRoomsCount(),
          fetchRegisteredUsersCount(),
          fetchTotalRevenue(),
        ]);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dashboard:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.header}>Thống Kê</Text>
      <View style={styles.grid}>
        <StatCard title="Tổng Số Loại Phòng" value={data.loaiPhong} color="#2ecc71" />
        <StatCard title="Tổng Số Phòng" value={data.tongPhong} color="#3498db" />
        <StatCard title="Khách Hàng Mới Đặt" value={data.khachMoi} color="#2980b9" />
        <StatCard title="Phòng Đã Đặt" value={data.phongDaDat} color="#1abc9c" />
        <StatCard title="Phòng Đang Trống" value={data.phongTrong} color="#27ae60" />
        <StatCard title="Phòng Đã Hủy" value={data.phongDaHuy} color="#e74c3c" />
        <StatCard title="Khách Hàng Đăng Ký" value={data.khachDangKy} color="#f39c12" />
        <StatCard title="Phản Hồi và Góp Ý" value={data.phanHoi} color="#f1c40f" />
        <StatCard title="Tổng Doanh Thu" value={data.doanhThu.toLocaleString() + ' VNĐ'} color="#9b59b6" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default DashboardContent;
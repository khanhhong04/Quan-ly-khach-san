// components/admin/DashboardContent.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface DashboardData {
  loaiPhong: number;
  tongPhong: number;
  khachMoi: number;
  phongDangDat: number;
  phongTrong: number;
  phongBiHuy: number;
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
  const data: DashboardData = {
    loaiPhong: 5,
    tongPhong: 50,
    khachMoi: 12,
    phongDangDat: 20,
    phongTrong: 25,
    phongBiHuy: 5,
    khachDangKy: 30,
    phanHoi: 8,
    doanhThu: 50000000,
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.header}>Thống Kê</Text>
      <View style={styles.grid}>
        <StatCard title="Tổng Số Loại Phòng" value={data.loaiPhong} color="#2ecc71" />
        <StatCard title="Tổng Số Phòng" value={data.tongPhong} color="#3498db" />
        <StatCard title="Khách Hàng Mới Đặt" value={data.khachMoi} color="#2980b9" />
        <StatCard title="Phòng Đang Đặt" value={data.phongDangDat} color="#1abc9c" />
        <StatCard title="Phòng Đang Trống" value={data.phongTrong} color="#27ae60" />
        <StatCard title="Phòng Bị Hủy" value={data.phongBiHuy} color="#e74c3c" />
        <StatCard title="Khách Hàng Đăng Ký" value={data.khachDangKy} color="#f39c12" />
        <StatCard title="Phản Hồi và Góp Ý" value={data.phanHoi} color="#f1c40f" />
        <StatCard title="Tổng Doanh Thu" value={data.doanhThu.toLocaleString() + ' VNĐ'} color="#16a085" />
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

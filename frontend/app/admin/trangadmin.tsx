// app/admin/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Sidebar from '../admin/Sidebar';
import DashboardContent from '../admin/DashboardContent';
import PhongMoiDat from '../admin/PhongMoiDat';
import XacNhanThanhToan from '../admin/XacNhanThanhToan';
import HoSoDatPhong from './HoSoDatPhong';
import Phong from '../admin/phong'; // Thêm import này
import KhachHang from '../admin/KhachHang';
// (Các component khác import tương tự nếu cần)

const AdminDashboardScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'PhongMoiDat':
        return <PhongMoiDat />;
      case 'XacNhanThanhToan':
        return <XacNhanThanhToan />;
      // case 'XacNhanThanhToan':
      case 'HoSoDatPhong':
        return <HoSoDatPhong />
      // case 'HoSoDatPhong':
      case 'Phong':
        return <Phong />;
      case 'KhachHang':
        return <KhachHang />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <View style={styles.container}>
      <Sidebar onNavigate={setCurrentScreen} />
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});

export default AdminDashboardScreen;

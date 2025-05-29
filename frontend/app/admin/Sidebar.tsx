// components/admin/Sidebar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onNavigate: (screen: string) => void;
}

const Sidebar: React.FC<Props> = ({ onNavigate }) => {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>ADMIN</Text>
      <TouchableOpacity onPress={() => onNavigate('Dashboard')}>
        <Text style={styles.link}>Trang chủ</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('PhongMoiDat')}>
        <Text style={styles.link}>Phòng mới đặt</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('XacNhanThanhToan')}>
        <Text style={styles.link}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('HoSoDatPhong')}>
        <Text style={styles.link}>Hồ sơ đặt phòng</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('Phong')}>
        <Text style={styles.link}>Danh sách phòng</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('KhachHang')}>
        <Text style={styles.link}>Danh sách tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: '#1e1e1e',
    paddingVertical: 30,
    paddingHorizontal: 16,
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  link: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 12,
  },
});

export default Sidebar;

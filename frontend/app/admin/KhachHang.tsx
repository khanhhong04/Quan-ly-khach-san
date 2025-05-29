import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  ID: number;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  TaiKhoan: string;
  RoleID: number;
}

const KhachHang: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setError('Không tìm thấy token đăng nhập. Vui lòng đăng nhập.');
          return;
        }

        const response = await fetch('http://192.168.1.134:3001/api/auth/all-users', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Phản hồi API không thành công: ${response.status}`);
        }

        const data = await response.json();
        console.log('All users API response:', data);

        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setError('Không có dữ liệu người dùng nào được trả về.');
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        setError('Không thể lấy dữ liệu người dùng: ' + error.message);
      }
    };

    fetchAllUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.ID.toString().includes(searchQuery) ||
    user.HoTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.TaiKhoan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleText = (roleId: number) => {
    switch (roleId) {
      case 1: return 'Người dùng';
      case 3: return 'Admin';
      default: return 'Không xác định';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DANH SÁCH TÀI KHOẢN</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Nhập để tìm kiếm (ID, Họ tên, Tài khoản, Email)..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>#</Text>
        <Text style={styles.headerCell}>HỌ TÊN</Text>
        <Text style={styles.headerCell}>TÀI KHOẢN</Text>
        <Text style={styles.headerCell}>EMAIL</Text>
        <Text style={styles.headerCell}>SỐ ĐIỆN THOẠI</Text>
        <Text style={styles.headerCell}>QUYỀN</Text>
      </View>

      {filteredUsers.length === 0 ? (
        <Text style={styles.noDataText}>Không có dữ liệu tài khoản để hiển thị.</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={styles.cell}>{item.HoTen}</Text>
              <Text style={styles.cell}>{item.TaiKhoan}</Text>
              <Text style={styles.cell}>{item.Email}</Text>
              <Text style={styles.cell}>{item.SoDienThoai}</Text>
              <Text style={styles.cell}>{getRoleText(item.RoleID)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    padding: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerCell: { flex: 1, fontWeight: 'bold', fontSize: 12 },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 8,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default KhachHang;
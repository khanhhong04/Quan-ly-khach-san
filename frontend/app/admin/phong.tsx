import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Button, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Room {
  MaPhong: number;
  SoPhong: string;
  Tang: number;
  TenLoaiPhong: string;
  SoNguoiToiDa: number;
  MoTa: string;
  GiaPhong: number;
  TrangThai: 'TRONG' | 'DA_THUE' | 'DANG_SU_DUNG' | 'DA_HUY' | 'DA_THANH_TOAN' | 'CHO_XU_LY_HUY';
  images: string[];
}

const Phong: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({});
  const [editRoom, setEditRoom] = useState<Partial<Room>>({});
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setError('Không tìm thấy token đăng nhập. Vui lòng đăng nhập.');
          return;
        }

        const response = await fetch('http://192.168.1.134:3001/api/rooms/all', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Phản hồi API không thành công: ${response.status}`);
        }

        const data = await response.json();
        if (data.rooms && Array.isArray(data.rooms)) {
          setRooms(data.rooms);
        } else {
          setError('Không có dữ liệu phòng nào được trả về.');
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy danh sách phòng:', error);
        setError('Không thể lấy dữ liệu phòng: ' + error.message);
      }
    };

    const checkAdmin = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setIsAdminUser(false);
          return;
        }

        const response = await fetch('http://192.168.1.134:3001/api/auth/verify-token', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setIsAdminUser(false);
          return;
        }

        const data = await response.json();
        setIsAdminUser(data.success && data.decoded.role === 3);
      } catch (error) {
        console.error('Lỗi kiểm tra admin:', error);
        setIsAdminUser(false);
      }
    };

    fetchAllRooms();
    checkAdmin();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.MaPhong.toString().includes(searchQuery) ||
    room.SoPhong.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.TenLoaiPhong.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DA_THUE': return { backgroundColor: '#d4edda', color: '#155724' };
      case 'DA_THANH_TOAN': return { backgroundColor: '#d1ecf1', color: '#0c5460' };
      case 'DA_HUY': return { backgroundColor: '#f8d7da', color: '#721c24' };
      case 'TRONG': return { backgroundColor: '#e0f7fa', color: '#006064' };
      case 'DANG_SU_DUNG': return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'CHO_XU_LY_HUY': return { backgroundColor: '#fcedb7', color: '#7b5e0b' };
      default: return { backgroundColor: '#f0f0f0', color: '#333' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DA_THUE': return 'Đã Thuê';
      case 'DA_THANH_TOAN': return 'Đã Thanh Toán';
      case 'DA_HUY': return 'Đã Hủy';
      case 'TRONG': return 'Trống';
      case 'DANG_SU_DUNG': return 'Đang Sử Dụng';
      case 'CHO_XU_LY_HUY': return 'Chờ Xử Lý Hủy';
      default: return status;
    }
  };

  const handleAddRoom = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('Không tìm thấy token đăng nhập.');
        return;
      }

      const response = await fetch('http://192.168.1.134:3001/api/rooms/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          SoPhong: newRoom.SoPhong,
          Tang: newRoom.Tang,
          TenLoaiPhong: newRoom.TenLoaiPhong,
          SoNguoiToiDa: newRoom.SoNguoiToiDa,
          MoTa: newRoom.MoTa,
          GiaPhong: newRoom.GiaPhong,
          TrangThai: newRoom.TrangThai,
        }),
      });

      if (!response.ok) {
        throw new Error(`Phản hồi API không thành công: ${response.status}`);
      }

      const data = await response.json();
      setRooms([...rooms, { MaPhong: data.MaPhong, ...newRoom } as Room]);
      setModalVisible(false);
      setNewRoom({});
      Alert.alert('Thành công', 'Thêm phòng thành công');
    } catch (error: any) {
      console.error('Lỗi khi thêm phòng:', error);
      setError('Không thể thêm phòng: ' + error.message);
    }
  };

  const handleEditRoom = async () => {
    if (!selectedRoom) return;
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('Không tìm thấy token đăng nhập.');
        return;
      }

      const response = await fetch(`http://192.168.1.134:3001/api/rooms/update/${selectedRoom.SoPhong}`, { // Sử dụng SoPhong thay vì MaPhong
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Tang: editRoom.Tang,
          TenLoaiPhong: editRoom.TenLoaiPhong,
          SoNguoiToiDa: editRoom.SoNguoiToiDa,
          MoTa: editRoom.MoTa,
          GiaPhong: editRoom.GiaPhong,
          TrangThai: editRoom.TrangThai,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Phản hồi API không thành công: ${response.status} - ${errorData.message}`);
      }

      const updatedRooms = rooms.map(room =>
        room.SoPhong === selectedRoom.SoPhong ? { ...room, ...editRoom } : room // Sử dụng SoPhong thay vì MaPhong
      );
      setRooms(updatedRooms);
      setEditModalVisible(false);
      setSelectedRoom(null);
      setEditRoom({});
      Alert.alert('Thành công', 'Cập nhật phòng thành công');
    } catch (error: any) {
      console.error('Lỗi khi sửa phòng:', error);
      setError('Không thể sửa phòng: ' + error.message);
    }
  };

  const handleDeleteRoom = async (SoPhong: string) => { // Sử dụng SoPhong thay vì MaPhong
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('Không tìm thấy token đăng nhập.');
        return;
      }

      const response = await fetch(`http://192.168.1.134:3001/api/rooms/delete/${SoPhong}`, { // Sử dụng SoPhong thay vì MaPhong
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Phản hồi API không thành công: ${response.status} - ${errorData.message}`);
      }

      setRooms(rooms.filter(room => room.SoPhong !== SoPhong)); // Sử dụng SoPhong thay vì MaPhong
      Alert.alert('Thành công', 'Xóa phòng thành công');
    } catch (error: any) {
      console.error('Lỗi khi xóa phòng:', error);
      setError('Không thể xóa phòng: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DANH SÁCH PHÒNG</Text>
      {isAdminUser && (
        <Button title="Thêm Phòng" onPress={() => setModalVisible(true)} color="#007AFF" />
      )}
      <TextInput
        style={styles.searchInput}
        placeholder="Nhập để tìm kiếm (Mã phòng, Số phòng, Loại phòng)..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>#</Text>
        <Text style={styles.headerCell}>MÃ PHÒNG</Text>
        <Text style={styles.headerCell}>SỐ PHÒNG</Text>
        <Text style={styles.headerCell}>LOẠI PHÒNG</Text>
        <Text style={styles.headerCell}>GIÁ</Text>
        <Text style={styles.headerCell}>TRẠNG THÁI</Text>
        {isAdminUser && <Text style={styles.headerCell}>HÀNH ĐỘNG</Text>}
      </View>

      {filteredRooms.length === 0 ? (
        <Text style={styles.noDataText}>Không có dữ liệu phòng để hiển thị.</Text>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.SoPhong} // Sử dụng SoPhong thay vì MaPhong
          renderItem={({ item, index }) => {
            const statusStyle = getStatusStyle(item.TrangThai);
            return (
              <View style={styles.row}>
                <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
                <Text style={styles.cell}>{item.MaPhong}</Text>
                <Text style={styles.cell}>{item.SoPhong}</Text>
                <Text style={styles.cell}>{item.TenLoaiPhong}</Text>
                <Text style={styles.cell}>{item.GiaPhong.toLocaleString()} vnd</Text>
                <View style={[styles.cell, styles.statusCell, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={{ color: statusStyle.color, fontWeight: 'bold', textAlign: 'center' }}>
                    {getStatusText(item.TrangThai)}
                  </Text>
                </View>
                {isAdminUser && (
                  <View style={styles.cell}>
                    <Button title="Sửa" onPress={() => {
                      setSelectedRoom(item);
                      setEditRoom(item);
                      setEditModalVisible(true);
                    }} color="#FFA500" />
                    <Button title="Xóa" onPress={() => handleDeleteRoom(item.SoPhong)} color="#FF0000" /> {/* Sử dụng SoPhong thay vì MaPhong */}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Modal thêm phòng */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Phòng Mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Số phòng"
              value={newRoom.SoPhong}
              onChangeText={(text) => setNewRoom({ ...newRoom, SoPhong: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tầng"
              value={newRoom.Tang?.toString()}
              onChangeText={(text) => setNewRoom({ ...newRoom, Tang: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Loại phòng"
              value={newRoom.TenLoaiPhong}
              onChangeText={(text) => setNewRoom({ ...newRoom, TenLoaiPhong: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số người tối đa"
              value={newRoom.SoNguoiToiDa?.toString()}
              onChangeText={(text) => setNewRoom({ ...newRoom, SoNguoiToiDa: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Mô tả"
              value={newRoom.MoTa}
              onChangeText={(text) => setNewRoom({ ...newRoom, MoTa: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Giá phòng"
              value={newRoom.GiaPhong?.toString()}
              onChangeText={(text) => setNewRoom({ ...newRoom, GiaPhong: parseFloat(text) || 0 })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Trạng thái"
              value={newRoom.TrangThai}
              onChangeText={(text) => setNewRoom({ ...newRoom, TrangThai: text as Room['TrangThai'] })}
            />
            <View style={styles.modalButtons}>
              <Button title="Hủy" onPress={() => setModalVisible(false)} color="#FF0000" />
              <Button title="Thêm" onPress={handleAddRoom} color="#007AFF" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal sửa phòng */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa Thông Tin Phòng</Text>
            <TextInput
              style={styles.input}
              placeholder="Số phòng"
              value={editRoom.SoPhong}
              editable={false} // Không cho phép chỉnh sửa SoPhong vì nó là định danh chính
            />
            <TextInput
              style={styles.input}
              placeholder="Tầng"
              value={editRoom.Tang?.toString()}
              onChangeText={(text) => setEditRoom({ ...editRoom, Tang: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Loại phòng"
              value={editRoom.TenLoaiPhong}
              onChangeText={(text) => setEditRoom({ ...editRoom, TenLoaiPhong: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số người tối đa"
              value={editRoom.SoNguoiToiDa?.toString()}
              onChangeText={(text) => setEditRoom({ ...editRoom, SoNguoiToiDa: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Mô tả"
              value={editRoom.MoTa}
              onChangeText={(text) => setEditRoom({ ...editRoom, MoTa: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Giá phòng"
              value={editRoom.GiaPhong?.toString()}
              onChangeText={(text) => setEditRoom({ ...editRoom, GiaPhong: parseFloat(text) || 0 })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Trạng thái"
              value={editRoom.TrangThai}
              onChangeText={(text) => setEditRoom({ ...editRoom, TrangThai: text as Room['TrangThai'] })}
            />
            <View style={styles.modalButtons}>
              <Button title="Hủy" onPress={() => setEditModalVisible(false)} color="#FF0000" />
              <Button title="Lưu" onPress={handleEditRoom} color="#007AFF" />
            </View>
          </View>
        </View>
      </Modal>
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
  statusCell: {
    borderRadius: 4,
    padding: 4,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default Phong;
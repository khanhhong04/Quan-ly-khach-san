import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.1.197:3001/api/auth";

const LoginScreen: React.FC = () => {
  const [taiKhoan, setTaiKhoan] = useState<string>('');
  const [matKhau, setMatKhau] = useState<string>('');
  const [accountList, setAccountList] = useState<string[]>([]);
  const [showAccountList, setShowAccountList] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async () => {
      const savedAccounts = await AsyncStorage.getItem('accountHistory');
      if (savedAccounts) {
        setAccountList(JSON.parse(savedAccounts));
      }
    };
    fetchAccounts();
  }, []);

  const handleLogin = async () => {
    console.log("📝 Nhập tài khoản:", taiKhoan);
    console.log("📝 Nhập mật khẩu:", matKhau);

    if (!taiKhoan.trim() || !matKhau.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
      return;
    }

    const requestData = {
      TaiKhoan: taiKhoan,
      MatKhau: matKhau
    };
    
    console.log("📤 Gửi request:", requestData);

    try {
      const response = await axios.post(`${API_URL}/login`, requestData);

      console.log("✅ Phản hồi từ server:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));

        const existingAccounts = await AsyncStorage.getItem('accountHistory');
        let accounts = existingAccounts ? JSON.parse(existingAccounts) : [];

        if (!accounts.includes(taiKhoan)) {
          accounts.push(taiKhoan);
          await AsyncStorage.setItem('accountHistory', JSON.stringify(accounts));
          setAccountList(accounts);
        }

        // Kiểm tra RoleID để điều hướng
        if (user.RoleID === 3) {
          router.push('/admin/trangadmin'); // Chuyển hướng đến trangadmin nếu là admin
        } else {
          router.push('/home/trangchu'); // Chuyển hướng đến trangchu nếu không phải admin
        }
      } else {
        Alert.alert('Lỗi', response.data.message || 'Sai thông tin đăng nhập');
      }
    } catch (error: any) {
      console.error("❌ Lỗi đăng nhập:", error);
      console.log("📥 Phản hồi lỗi từ server:", error.response?.data);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể kết nối đến server.');
    }
  };

  const handleDeleteAccount = async (accountToDelete: string) => {
    const updatedAccounts = accountList.filter(account => account !== accountToDelete);
    setAccountList(updatedAccounts);
    await AsyncStorage.setItem('accountHistory', JSON.stringify(updatedAccounts));
    
    if (taiKhoan === accountToDelete) {
      setTaiKhoan('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.subText}>Đăng nhập để tiếp tục</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tài khoản"
          placeholderTextColor="#999"
          value={taiKhoan}
          onFocus={() => setShowAccountList(true)}
          onChangeText={(text) => {
            setTaiKhoan(text);
            setShowAccountList(true);
          }}
        />

        {showAccountList && accountList.length > 0 && (
          <View style={styles.dropdown}>
            {accountList.map((account, index) => (
              <View key={index} style={styles.dropdownItemContainer}>
                <TouchableOpacity
                  style={styles.dropdownItemText}
                  onPress={() => {
                    setTaiKhoan(account);
                    setShowAccountList(false);
                  }}
                >
                  <Text style={styles.dropdownItem}>{account}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAccount(account)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry
          value={matKhau}
          onChangeText={setMatKhau}
        />
        <TouchableOpacity>
          <Text style={styles.forgotPassword} onPress={() => router.push('/auth/quenmk')}>
            Quên Mật Khẩu
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>hoặc</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/auth/dangki')}>
        <Text style={styles.registerButtonText}>Tạo Tài Khoản</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    maxHeight: 120,
    marginBottom: 10,
    elevation: 2,
    zIndex: 10,
  },
  dropdownItem: {
    fontSize: 16,
  },
  dropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  dropdownItemText: {
    flex: 1,
    padding: 10,
  },
  deleteButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#808080',
    fontWeight: 'bold',
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#1E90FF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#1E90FF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
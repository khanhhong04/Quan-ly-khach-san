import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.20.15:3001/api/auth"; // Địa chỉ API backend

const LoginScreen: React.FC = () => {
  const [taiKhoan, setTaiKhoan] = useState<string>('');
  const [matKhau, setMatKhau] = useState<string>('');
  const router = useRouter();

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

        Alert.alert('Thành công', 'Đăng nhập thành công!');
        router.push('/home/trangchu'); 
      } else {
        Alert.alert('Lỗi', response.data.message || 'Sai thông tin đăng nhập');
      }
    } catch (error: any) {
      console.error("❌ Lỗi đăng nhập:", error);
      console.log("📥 Phản hồi lỗi từ server:", error.response?.data);

      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể kết nối đến server.');
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
          onChangeText={setTaiKhoan}
        />
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
    marginBottom: 15,
    fontSize: 16,
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
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons'; // Import icon

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // Bước 1: Nhập email, Bước 2: Nhập OTP và mật khẩu mới
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email!');
      return;
    }

    try {
      const response = await fetch('http://192.168.3.102:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thành công', data.message || 'Mã OTP đã được gửi đến email của bạn!');
        setStep(2); // Chuyển sang bước 2
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể gửi mã OTP. Vui lòng thử lại!');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Lỗi kết nối tới server. Vui lòng kiểm tra lại!');
      console.error('Error sending OTP:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP và mật khẩu mới!');
      return;
    }

    try {
      const response = await fetch('http://192.168.3.102:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          otp: otp,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thành công', data.message || 'Mật khẩu đã được khôi phục thành công.');
        router.push('/'); // Chuyển hướng về trang đăng nhập
      } else {
        Alert.alert('Lỗi', data.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Lỗi kết nối tới server. Vui lòng kiểm tra lại!');
      console.error('Error resetting password:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Nút Quay lại với icon */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-back" size={24} color="#003087" />
      </TouchableOpacity>

      {/* Header với logo ở giữa */}
      <View style={styles.header}>
        <Image source={require('../../assets/images/anh3.png')} style={styles.logo} />
      </View>

      {/* Tiêu đề và nội dung */}
      <Text style={styles.title}>Khôi phục mật khẩu</Text>
      {step === 1 ? (
        <>
          <Text style={styles.subtitle}>Nhập email để nhận mã OTP</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
            <Text style={styles.buttonText}>Gửi mã OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Nhập mã OTP và mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mã OTP"
              placeholderTextColor="#aaa"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#aaa"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 100,
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#003087',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
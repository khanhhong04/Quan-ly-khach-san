import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons'; // Import icon

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // Bước 1: Nhập email, Bước 2: Nhập OTP và mật khẩu mới
  const [otpRequestCount, setOtpRequestCount] = useState(0); // Đếm số lần gửi OTP
  const [isLocked, setIsLocked] = useState(false); // Trạng thái khóa
  const [lockTime, setLockTime] = useState<number | null>(null); // Thời gian khóa
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email!');
      return;
    }

    // Kiểm tra nếu đang bị khóa
    if (isLocked && lockTime) {
      const currentTime = Date.now();
      const timeElapsed = (currentTime - lockTime) / 1000 / 60; // Tính thời gian đã trôi qua (phút)
      if (timeElapsed < 10) {
        console.log("Gửi mã OTP quá 3 lần. Vui lòng chờ 10 phút để thử lại. Email:", email); // Thêm log
        Alert.alert('Lỗi', 'Bạn đã gửi mã OTP quá 3 lần. Vui lòng chờ 10 phút để thử lại!');
        return;
      } else {
        // Hết thời gian khóa, reset trạng thái
        setIsLocked(false);
        setLockTime(null);
        setOtpRequestCount(0);
      }
    }

    try {
      setOtpRequestCount((prev) => prev + 1); // Tăng số lần gửi OTP

      const response = await fetch('http://192.168.1.134:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Mã OTP quên mật khẩu đã được gửi đến email:", email);
        Alert.alert('Thành công', data.message || 'Mã OTP đã được gửi đến email của bạn!');
        setStep(2); // Chuyển sang bước 2
      } else {
        if (otpRequestCount + 1 >= 3) {
          setIsLocked(true);
          setLockTime(Date.now()); // Ghi lại thời gian khóa
          console.log("Gửi mã OTP quá 3 lần. Vui lòng chờ 10 phút để thử lại. Email:", email); // Thêm log
          Alert.alert('Lỗi', 'Bạn đã gửi mã OTP quá 3 lần. Vui lòng chờ 10 phút để thử lại!');
        } else if (data.message.toLowerCase().includes('email') || data.message.toLowerCase().includes('khong ton tai') || data.message.toLowerCase().includes('not found')) {
          console.log("Email không tồn tại trong hệ thống:", email);
        }
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
      const response = await fetch('http://192.168.1.134:3001/api/auth/verify-otp', {
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
        console.log("Đặt lại mật khẩu thành công cho email:", email); // Thêm log
        Alert.alert('Thành công', data.message || 'Mật khẩu đã được khôi phục thành công.');
        setOtpRequestCount(0); // Reset số lần gửi OTP khi đặt lại mật khẩu thành công
        setIsLocked(false);
        setLockTime(null);
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
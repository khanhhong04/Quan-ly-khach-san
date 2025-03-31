import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons'; // Import icon
import axios from 'axios';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);


const handleSignup = async () => {
  if (!fullName || !phoneNumber || !email || !username || !password || !confirmPassword) {
    Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp.');
    return;
  }

  if (!agreeTerms) {
    Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng.');
    return;
  }

  try {
    const response = await axios.post('http://192.168.3.100:3001/api/auth/register', { 
      HoTen: fullName,
      Email: email,
      SoDienThoai: phoneNumber,
      TaiKhoan: username,
      MatKhau: password,
    });

    Alert.alert('Thành công', 'Tạo tài khoản thành công!');
    router.push('/');
  }catch (error) {
    console.error('Lỗi đăng ký:', error);
  
    if (axios.isAxiosError(error)) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Đăng ký thất bại!');
    } else {
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại!');
    }
  }
  
};

  
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#2b4380" />
        </TouchableOpacity>

        <Image source={require('../../assets/images/anh3.png')} style={styles.logo} />
        
        <Text style={styles.title}>Đăng ký tài khoản</Text>
        <Text style={styles.subtitle}>Điền vào các thông tin dưới đây để đăng ký tài khoản</Text>

        <Text style={styles.label}>Họ và Tên</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="" />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="" />

        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="" />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="" />

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="" />

        <View style={styles.termsContainer}>
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreeTerms(!agreeTerms)}>
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
              {agreeTerms && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Tôi đồng ý với <Text style={styles.linkText}>Điều khoản sử dụng</Text> và <Text style={styles.linkText}>Chính sách bảo mật</Text>.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText} >Tạo tài khoản</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  logo: {
    width: 300,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#2b4380',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2b4380',
  },
  checkMark: {
    color: 'white',
    fontSize: 14,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#2b4380',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#2b4380',
    fontWeight: 'bold',
    fontSize: 14,
  },
  linkText: {
    color: '#2b4380',
    textDecorationLine: 'underline',
  },
  
});

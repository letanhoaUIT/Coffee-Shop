import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../api/axiosConfig';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = '652960102976-2a7hv34maujfapuf0l9jj54sshah3dha.apps.googleusercontent.com';
const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
};

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Lấy hàm login từ AuthContext
  const navigation = useNavigation();

  /**
   * 🔑 Xử lý đăng nhập
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email và Mật khẩu');
      return;
    }

    try {
      // Gửi yêu cầu đăng nhập đến backend
      const response = await api.post('auth/login', { email, password });

      if (response.data?.token) {
        // Gọi hàm login từ AuthContext và truyền token
        await login(response.data.token);

        Alert.alert('Thành công', 'Đăng nhập thành công!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeScn' }],
        });
      } else {
        Alert.alert('Lỗi', 'Token không hợp lệ từ máy chủ');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    }
  };

  /**
    * 🔗 Xử lý đăng nhập bằng Google
    */

  const handleGoogleLogin = async () => {
    try {
      // Tạo URL Redirect
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      // Xây dựng cấu hình yêu cầu
      const config = {
        clientId: CLIENT_ID,
        redirectUri,
        scopes: ['openid', 'email', 'profile'],
        responseType: 'code',
      };

      // Tạo yêu cầu và load yêu cầu
      const request = await AuthSession.loadAsync(config, DISCOVERY);

      // Hiển thị màn hình đăng nhập
      const result = await request.promptAsync(DISCOVERY);

      if (result.type === 'success') {
        const { code } = result.params;

        // Trao đổi mã code để lấy token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: CLIENT_ID,
            code,
            redirectUri,
          },
          DISCOVERY
        );

        const { accessToken } = tokenResponse;

        // Lấy thông tin người dùng
        const userInfo = await AuthSession.fetchUserInfoAsync(
          { accessToken },
          DISCOVERY
        );

        console.log('User Info:', userInfo);
        Alert.alert('Đăng nhập thành công', `Chào mừng ${userInfo.name}!`);
      } else {
        Alert.alert('Đăng nhập thất bại', 'Không thể đăng nhập bằng Google.');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng nhập bằng Google.');
    }
  };






  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.image} />
      
      {/* Tiêu đề */}
      <Text style={styles.title}>Chào mừng bạn!</Text>

      {/* Trường Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Trường Mật khẩu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#888888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Nút Đăng nhập */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Phân cách */}
      <Text style={styles.orText}>Hoặc đăng nhập với...</Text>

      {/* Nút Google Login */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Icon name="google" size={24} color="white" />
      </TouchableOpacity>


      {/* Liên kết đến màn hình Đăng ký */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Bạn chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#0f4359',
  },
  inputContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#0f4359',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  googleButton: {
    backgroundColor: '#db4437', // Màu đỏ của Google
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: 100,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  registerLink: {
    color: '#0f4359',
    textAlign: 'center',
    fontSize: 16,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#0f4359',
    marginVertical: 15,
  },
});

export default LoginScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './context/AuthContext'; 
import api from '../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const UserProfileScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { logout } = useAuth(); 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setError('Token không hợp lệ hoặc hết hạn');
          return;
        }

        // Lấy thông tin user
        const profileResponse = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profileResponse.data.user);

        // Lấy thông tin địa chỉ
        const addressResponse = await api.get('/auth/user/address', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddress(addressResponse.data.address || 'No address provided');
      } catch (err) {
        console.error(err);
        setError('Không thể lấy thông tin người dùng hoặc địa chỉ');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!address) {
      Alert.alert('Error', 'Address cannot be empty');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token is missing');
        return;
      }

      // Gọi API để lưu địa chỉ
      const response = await api.put(
        '/auth/user/address',
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Address updated successfully');
      console.log(response.data); // In ra kết quả từ API nếu cần
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update address');
    }
  };


  const handleLogout = async () => {
    try {
      await logout(); // Xóa token và thông tin xác thực
      // Không xóa giỏ hàng khỏi AsyncStorage khi logout
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
  
      Alert.alert('Đăng xuất thành công', 'Bạn đã đăng xuất khỏi tài khoản.');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng xuất.');
    }
  };

  const handleBackToHome = () => {
    navigation.goBack();
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Icon name="share-alt" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* User Information */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: user?.avatar || 'https://uploads.commoninja.com/searchengine/wordpress/user-avatar-reloaded.png' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.full_name}</Text>
        <Text style={styles.userHandle}>@{user?.username}</Text>

        <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changePasswordButton} onPress={() => navigation.navigate('ChangePassword')}>
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        <View style={[styles.rowContainer]}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={(text) => setAddress(text)} // Cập nhật state khi nhập
            onBlur={handleSave} // Gọi API khi rời khỏi ô nhập liệu
            placeholder="Enter your address"
          />
        </View>




        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  profileContainer: { alignItems: 'center', marginTop: 40 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  userName: { fontSize: 24, fontWeight: 'bold' },
  userHandle: { fontSize: 16, color: 'gray', marginBottom: 20 },
  editProfileButton: { backgroundColor: '#E0E0E0', borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10 },
  editProfileText: { fontSize: 16, fontWeight: 'bold' },
  changePasswordButton: { backgroundColor: '#E0E0E0', borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10, marginTop: 20 },
  changePasswordText: { fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#FF3B30', borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10, marginTop: 20 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rowContainer: {
    flexDirection: 'row', // Sắp xếp các phần tử cùng một hàng
    alignItems: 'center', // Canh giữa theo trục dọc
    marginBottom: 16,
    marginTop: 30,
    overflow: 'hidden', // Ẩn nội dung vượt ra ngoài
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8, // Tạo khoảng cách giữa chữ và ô
    flexShrink: 0, // Không thu nhỏ chữ khi không đủ không gian
  },
  input: {
    flex: 1, // Ô nhập liệu chiếm toàn bộ không gian còn lại
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    overflow: 'hidden', // Ẩn phần nội dung tràn
  },
});

export default UserProfileScreen;

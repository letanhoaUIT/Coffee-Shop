// src/screens/EditProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  
  // State để lưu thông tin người dùng
  const [avatar, setAvatar] = useState('https://uploads.commoninja.com/searchengine/wordpress/user-avatar-reloaded.png');
  const [fullName, setFullName] = useState('Ebenezer Omosuli');
  const [email, setEmail] = useState('ebenux123@gmail.com');
  const [tagName, setTagName] = useState('@eben');

  // Lấy thông tin người dùng khi màn hình được render
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const response = await api.get('auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const user = response.data.user;
          setAvatar(user.avatar || avatar);
          setFullName(user.full_name);
          setEmail(user.email);
          setTagName(user.username);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserProfile();
  }, []);

  // Function để chọn ảnh mới từ thư viện
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri); // Set the selected image as avatar
    }
  };

  // Function lưu thông tin cập nhật
  const handleSaveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        return;
      }

      const response = await api.put('auth/profile', {
        full_name: fullName,
        email: email,
        username: tagName,
        avatar: avatar, // Gửi avatar (có thể là URI hoặc base64)
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack(); // Quay lại màn hình trước đó
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      {/* Avatar */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: avatar }} 
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Icon name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput 
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor="#888888"
        />
        <TextInput 
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#888888"
        />
        <TextInput 
          style={styles.input}
          value={tagName}
          onChangeText={setTagName}
          placeholder="Tag name"
          placeholderTextColor="#888888"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 50,
  },
  form: {
    marginTop: 20,
  },
  input: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;

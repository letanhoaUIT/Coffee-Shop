import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axiosConfig';  // Assuming you're using axios to make requests
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing JWT

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  // Function to handle password update
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }

    try {
      // Get the JWT token from AsyncStorage (or wherever you're storing it)
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        return;
      }

      // Make the API request to change the password
      const response = await api.put(
        'auth/change-password', // Replace with your correct backend URL
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
          },
        }
      );

      // Handle success response
      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack();
    } catch (error) {
      // Handle error response
      if (error.response) {
        // The server responded with a status other than 200
        Alert.alert('Error', error.response.data.message || 'Something went wrong');
      } else {
        // Network or other errors
        Alert.alert('Error', 'Network error. Please try again later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          placeholderTextColor="#888888"
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          placeholderTextColor="#888888"
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          placeholderTextColor="#888888"
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
        <Text style={styles.updateButtonText}>Update Password</Text>
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
  form: {
    marginTop: 40,
  },
  input: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChangePasswordScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../../api/axiosConfig';

// Định nghĩa kiểu cho params của route
type RootStackParamList = {
  NewCredentials: { email: string };
  Login: undefined;
};

type NewCredentialsRouteProp = RouteProp<RootStackParamList, 'NewCredentials'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'NewCredentials'>;

interface Props {
  route: NewCredentialsRouteProp;
}

const NewCredentials: React.FC<Props> = ({ route }) => {
  const { email } = route.params; // Nhận email từ route params
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Both fields are required!');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try {
      // Gửi yêu cầu để cập nhật mật khẩu
      const response = await api.post('auth/update-password', { email, newPassword });

      if (response.status === 200) {
        Alert.alert('Success', 'Your password has been updated!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEW CREDENTIALS</Text>
      <Text style={styles.subtitle}>Your identity has been verified! Set your new password</Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        autoCapitalize="none"
        testID="new-password-input" // Thêm testID cho việc kiểm thử
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
        testID="confirm-password-input" // Thêm testID cho việc kiểm thử
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate} testID="update-button">
        <Text style={styles.buttonText}>UPDATE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 20, color: 'gray' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5 },
  button: { backgroundColor: 'yellow', padding: 10, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'black', fontSize: 16, fontWeight: 'bold' },
});

export default NewCredentials;

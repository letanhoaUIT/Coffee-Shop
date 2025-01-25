import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../api/axiosConfig'; 
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';  
import { RootStackParamList } from '../navigation/types';  

type RigisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RigisterScreenNavigationProp>();  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!username) return 'Username is required';
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Invalid email format';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleRegister = async () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      Alert.alert('Validation Error', errorMessage);
      return;
    }
  
    try {
      const response = await api.post('auth/register', { 
        username, 
        email, 
        full_name: "",  
        password 
      });
      console.log('Registration successful:', response.data);
      Alert.alert('Success', 'Registration Successful!');
      navigation.navigate('Login');  
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Registration failed! Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.image}
      />
      <Text style={styles.title}>Register</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888888"
          value={username}
          onChangeText={setUsername}
        />
      </View>


      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888888"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
    fontSize: 16,
  },
  loginLink: {
    color: '#0f4359',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
  },
});

export default RegisterScreen;

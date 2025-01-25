import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'NewCredentials'>;

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleNext = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email!');
      return;
    }

    // Chuyển đến màn hình NewCredentials với email
    navigation.navigate('NewCredentials', { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FORGET PASSWORD</Text>
      <Text style={styles.subtitle}>Provide your account's email to reset your password!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>NEXT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10 },
  button: { backgroundColor: 'yellow', padding: 10, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'black', fontSize: 16 },
});

export default ForgotPasswordScreen;

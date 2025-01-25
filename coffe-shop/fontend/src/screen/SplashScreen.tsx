import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types'; // Import RootStackParamList từ nơi bạn khai báo kiểu các màn hình

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>; // Định nghĩa kiểu navigation

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>(); // Gán kiểu navigation cho SplashScreen

  useEffect(() => {
    setTimeout(() => {
      // Điều hướng đến LoginScreen sau 3 giây
      navigation.replace('Login'); // Sử dụng navigation.replace để thay thế màn hình hiện tại
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.text}>Coffee always makes us happy</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
});

export default SplashScreen;

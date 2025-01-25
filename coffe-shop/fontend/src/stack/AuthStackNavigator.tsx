// src/navigation/AuthStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screen/Login'
import RegisterScreen from '../screen/Register';
import ForgotPasswordScreen from '../screen/ForgetPassword/ForgotPassword';
import SplashScreen from '../screen/SplashScreen';
const Stack = createStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;

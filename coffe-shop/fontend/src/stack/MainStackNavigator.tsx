// src/navigation/MainStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import BeanDetailScreen from '../screen/BeanDetail';
import CoffeeDetailScreen from '../screen/CoffeeDetail';
import CartScreen from '../screen/Cart';
import PaymentScreen from '../screen/Payment';
import OrderHistoryScreen from '../screen/OrderHistory';
import UserProfileScreen from '../screen/UserProfile';
import UserStackNavigator from './UserStackNavigator';
import LoginScreen from '../screen/Login';
const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={BottomTabNavigator} />
      <Stack.Screen name="Bean" component={BeanDetailScreen} />
      <Stack.Screen name="CoffeeDetail" component={CoffeeDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="UserStack" component={UserStackNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;

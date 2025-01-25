// src/navigation/types.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeScn: undefined;
  ForgotPassword: undefined;
  NewCredentials: { email: string };
  Bean: { product: any}; 
  CoffeeDetail: { product: any };
  Cart: undefined;
  Payment: { totalPrice: number; cartItems: any[] }; 
  Favorites: undefined;
  OrderHistory: undefined;
  UserProfile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Splash: undefined;
};

export type BeanDetailScreenRouteProp = RouteProp<RootStackParamList, 'Bean'>;
export type BeanDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Bean'>;


import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; 
import AuthStackNavigator from './src/stack/AuthStackNavigator';
import MainStackNavigator from './src/stack/MainStackNavigator';
import { createStackNavigator } from '@react-navigation/stack';
import { CartProvider } from './src/screen/context/CartContext';
import { FavoritesProvider } from './src/screen/context/FavoritesContext';
import { AuthProvider, useAuth } from './src/screen/context/AuthContext'; 
const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth(); 

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <AppNavigator />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

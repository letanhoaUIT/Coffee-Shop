import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from '../screen/Home';
import CartScreen from '../screen/Cart';
import FavoritesScreen from '../screen/Favorites';
import OrderHistory from '../screen/OrderHistory';
import { useCart } from '../screen/context/CartContext';
import { useFavorites } from '../screen/context/FavoritesContext';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { cartItems } = useCart(); // Lấy danh sách sản phẩm từ CartContext
  const { favorites } = useFavorites();
  // Tính tổng số lượng sản phẩm yêu thích
  const favoritesCount = favorites.length;

  // Tính tổng số lượng sản phẩm
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Cart':
                iconName = 'shopping-cart';
                break;
              case 'Favorites':
                iconName = 'heart';
                break;
              case 'History':
                iconName = 'history';
                break;
            }

            return (
              <View>
                <Icon name={iconName} size={size} color={color} />
                {route.name === 'Cart' && totalItems >= 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{totalItems}</Text>
                  </View>
                )}
                {route.name === 'Favorites' && favoritesCount >= 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{favoritesCount}</Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarActiveTintColor: '#8d6e52',
          tabBarInactiveTintColor: 'white',
          tabBarStyle: {
            backgroundColor: '#0f4359',
            borderRadius: 30,
            paddingVertical: 10,
            marginHorizontal: 10,
            position: 'absolute',
            bottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="History" component={OrderHistory} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BottomTabNavigator;

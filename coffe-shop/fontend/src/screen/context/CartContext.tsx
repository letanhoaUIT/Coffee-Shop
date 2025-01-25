import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

type CartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  selectedSize: string;
  quantity: number;
  prices: { [key: string]: number };
  type: 'bean' | 'drink';
  productDetails?: any;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, selectedSize: string) => void;
  updateCartItem: (id: string, selectedSize: string, quantity?: number, newSize?: string) => void;
  syncCart: () => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC = ({ children }) => {
  const { userId } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /**
   * 🚀 Đồng bộ giỏ hàng từ AsyncStorage
   */
  const syncCart = async () => {
    if (!userId) return;

    try {
      const storedCart = await AsyncStorage.getItem(`cart_${userId}`);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error syncing cart from AsyncStorage:', error);
    }
  };

  /**
   * 🛒 Thêm vào giỏ hàng
   */
  const addToCart = async (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
      );
  
      let updatedCart;
  
      if (existingItemIndex !== -1) {
        // 🛠️ Sản phẩm đã tồn tại -> Tăng số lượng
        updatedCart = prevItems.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // 🛠️ Sản phẩm mới -> Thêm vào giỏ hàng
        updatedCart = [...prevItems, { ...item, quantity: 1 }];
      }
  
      AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  /**
   * 🗑️ Xóa sản phẩm khỏi giỏ hàng
   */
  const removeFromCart = async (id: string, selectedSize: string) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter((item) => !(item.id === id && item.selectedSize === selectedSize));
      AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
      return updatedCart;
    });
  };
  /**
   * 🗑️ Xóa toàn bộ giỏ hàng
   */
  const clearCart = async () => {
    try {
      // Xóa giỏ hàng trong trạng thái
      setCartItems([]);

      // Xóa giỏ hàng khỏi AsyncStorage
      await AsyncStorage.removeItem(`cart_${userId}`);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };
  /**
   * 🔄 Cập nhật sản phẩm trong giỏ hàng
   */
  const updateCartItem = async (
    id: string,
    selectedSize: string,
    quantity?: number,
    newSize?: string
  ) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.map((item) => {
        if (item.id === id && item.selectedSize === selectedSize) {
          let updatedItem = {
            ...item,
            quantity: quantity !== undefined ? quantity : item.quantity,
            selectedSize: newSize || item.selectedSize,
          };
  
          // 🛠️ Cập nhật giá dựa trên size mới
          if (newSize) {
            if (item.type === 'drink') {
              switch (newSize) {
                case 'S':
                  updatedItem.price = item.prices?.['price_s'] || item.price;
                  break;
                case 'M':
                  updatedItem.price = item.prices?.['price_m'] || item.price;
                  break;
                case 'L':
                  updatedItem.price = item.prices?.['price_l'] || item.price;
                  break;
              }
            } else if (item.type === 'bean') {
              switch (newSize) {
                case '250mg':
                  updatedItem.price = item.prices?.['price_250mg'] || item.price;
                  break;
                case '500mg':
                  updatedItem.price = item.prices?.['price_500mg'] || item.price;
                  break;
                case '1000mg':
                  updatedItem.price = item.prices?.['price_1000mg'] || item.price;
                  break;
              }
            }
          }
  
          return updatedItem;
        }
        return item;
      });
  
      AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  useEffect(() => {
    if (userId) {
      syncCart();
    }
  }, [userId]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartItem, syncCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

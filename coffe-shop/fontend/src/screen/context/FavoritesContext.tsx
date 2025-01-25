import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface FavoriteItem {
  _id: string;
  product_id: string;
  product_type: string;
  productDetails?: any;
}

interface FavoritesContextProps {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { userId, logout } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  /**
   * 🚀 Fetch danh sách yêu thích từ backend
   */
  const fetchFavorites = async () => {
    if (!userId) {
      setFavorites([]);
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        logout();
        return;
      }
  
      // Lấy danh sách yêu thích từ API
      const response = await api.get('/favorite', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log('Favorites API Response:', response.data);
  
      if (response.data) {
        // Fetch thông tin chi tiết từng sản phẩm
        const detailedFavorites = await Promise.all(
          response.data.map(async (fav: any) => {
            let productDetails = {};
            try {
              if (fav.product_type === 'drink') {
                const drinkResponse = await api.get(
                  `/products/coffee-drinks/${fav.product_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                productDetails = drinkResponse.data;
              } else if (fav.product_type === 'bean') {
                const beanResponse = await api.get(
                  `/products/coffee-beans/${fav.product_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                productDetails = beanResponse.data;
              }
            } catch (err) {
              console.error(`Failed to fetch details for product ${fav.product_id}`, err);
            }
  
            return {
              _id: fav._id,
              product_id: fav.product_id,
              product_type: fav.product_type,
              productDetails,
            };
          })
        );
  
        setFavorites(detailedFavorites);
        console.log('Formatted Favorites:', detailedFavorites);
      }
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  /**
   * 🧠 Toggle trạng thái yêu thích (Add/Remove)
   */
  const toggleFavorite = async (item: FavoriteItem) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        logout();
        return;
      }
  
      const existingFavorite = favorites.find((fav) => fav.product_id === item.product_id);
  
      if (existingFavorite) {
        // 🗑️ Xóa khỏi danh sách yêu thích
        await api.delete(`/favorite/${existingFavorite._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Thành công', 'Sản phẩm đã được xóa khỏi danh sách yêu thích.');
      } else {
        // ❤️ Thêm vào danh sách yêu thích
        await api.post(
          '/favorite',
          { product_id: item.product_id, product_type: item.product_type },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert('Thành công', 'Sản phẩm đã được thêm vào danh sách yêu thích.');
      }
  
      // Cập nhật danh sách yêu thích sau khi thêm/xóa
      await fetchFavorites();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  /**
   * 🧹 Xóa toàn bộ danh sách yêu thích (local state)
   */
  const clearFavorites = () => {
    setFavorites([]);
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, fetchFavorites, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextProps => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

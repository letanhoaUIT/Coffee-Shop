import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface AuthContextProps {
  isAuthenticated: boolean;
  userId: string | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * 📥 Đăng nhập người dùng và lưu token
   */
  const login = async (token: string) => {
    await AsyncStorage.setItem('authToken', token);
    const decoded: any = jwtDecode(token);
    setUserId(decoded?.userId || null);
    setIsAuthenticated(true);
  };

  /**
   * 🚪 Đăng xuất người dùng và xóa token
   */
  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setUserId(null);
    setIsAuthenticated(false);
  };

  /**
   * 🔍 Kiểm tra tính hợp lệ của token
   */
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

        if (decoded.exp && decoded.exp < currentTime) {
          // Token đã hết hạn
          await logout();
          return;
        }

        setUserId(decoded?.userId || null);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token Error:', error);
      await logout();
    }
  };

  /**
   * 🛠️ Chạy kiểm tra auth khi khởi động ứng dụng
   */
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 📦 Hook sử dụng AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/context/ThemeContext.js - Quản lý trạng thái giao diện Sáng / Tối (R07)
// =========================================================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import { lightColors, darkColors } from '../constants/theme';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Khôi phục trạng thái giao diện đã lưu từ AsyncStorage khi mở ứng dụng
  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedMode = await getStoredItem(STORAGE_KEYS.THEME, false);
      setIsDarkMode(Boolean(savedMode));
      setIsThemeLoaded(true);
    };
    loadSavedTheme();
  }, []);

  // Chuyển đổi qua lại giữa chế độ Sáng và Tối, đồng thời lưu bền vững vào AsyncStorage
  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await setStoredItem(STORAGE_KEYS.THEME, nextMode);
  };

  // Đặt lại giao diện về mặc định (Chế độ Sáng)
  const resetTheme = async () => {
    setIsDarkMode(false);
    await setStoredItem(STORAGE_KEYS.THEME, false);
  };

  // Lựa chọn bảng màu hiển thị theo trạng thái Dark Mode
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        colors,
        toggleTheme,
        resetTheme,
        isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook tiện ích để sử dụng ThemeContext trong toàn bộ ứng dụng
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phải được sử dụng bên trong ThemeProvider');
  }
  return context;
};

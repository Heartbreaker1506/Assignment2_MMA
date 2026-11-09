// Author: Trần Minh Quân - Student ID: CE181730

import React, { createContext, useState, useEffect, useContext } from 'react';
import { lightColors, darkColors } from '../constants/theme';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Restore saved theme mode from AsyncStorage on app launch
  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedMode = await getStoredItem(STORAGE_KEYS.THEME, false);
      setIsDarkMode(Boolean(savedMode));
      setIsThemeLoaded(true);
    };
    loadSavedTheme();
  }, []);

  // Toggle between light and dark mode and persist to storage
  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await setStoredItem(STORAGE_KEYS.THEME, nextMode);
  };

  const resetTheme = async () => {
    setIsDarkMode(false);
    await setStoredItem(STORAGE_KEYS.THEME, false);
  };

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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Author: Trần Minh Quân - Student ID: CE181730

import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys used for AsyncStorage across the app
export const STORAGE_KEYS = {
  CART: '@mma301_a2_cart_items',
  WISHLIST_CACHE: '@mma301_a2_wishlist_cache',
  ORDERS_CACHE: '@mma301_a2_orders_cache',
  THEME: '@mma301_a2_theme_mode',
  NOTIFICATION_SETTINGS: '@mma301_a2_notification_settings',
  NOTIFICATION_LOGS: '@mma301_a2_notification_logs',
  AI_HISTORY: '@mma301_a2_ai_history',
};

// Safely read and parse JSON data from AsyncStorage with fallback
export const getStoredItem = async (key, fallbackValue) => {
  try {
    const rawValue = await AsyncStorage.getItem(key);
    if (rawValue === null || rawValue === undefined) {
      return fallbackValue;
    }
    const parsed = JSON.parse(rawValue);
    return parsed !== null && parsed !== undefined ? parsed : fallbackValue;
  } catch (error) {
    console.warn(`[Storage] Failed to read key "${key}", using fallback:`, error);
    return fallbackValue;
  }
};

// Safely serialize and save data to AsyncStorage
export const setStoredItem = async (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save key "${key}":`, error);
    return false;
  }
};

// Remove a single item from AsyncStorage
export const removeStoredItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to remove key "${key}":`, error);
    return false;
  }
};

// Clear all stored app data to reset state
export const clearAllAppStorage = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('[Storage] Failed to clear app storage:', error);
    return false;
  }
};

// Format numeric values as USD currency strings
export const formatPrice = (amount) => {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return '$0.00';
  return `$${numeric.toFixed(2)}`;
};

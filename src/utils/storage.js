// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/utils/storage.js - Các hàm tiện ích đọc/ghi AsyncStorage an toàn
// =========================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// Các khóa định danh lưu trữ dữ liệu cục bộ trong AsyncStorage
export const STORAGE_KEYS = {
  CART: '@mma301_a2_cart_items',
  WISHLIST_CACHE: '@mma301_a2_wishlist_cache',
  ORDERS_CACHE: '@mma301_a2_orders_cache',
  THEME: '@mma301_a2_theme_mode',
  NOTIFICATION_SETTINGS: '@mma301_a2_notification_settings',
  NOTIFICATION_LOGS: '@mma301_a2_notification_logs',
  AI_HISTORY: '@mma301_a2_ai_history',
};

// Đọc và phân giải JSON an toàn từ AsyncStorage kèm giá trị dự phòng
export const getStoredItem = async (key, fallbackValue) => {
  try {
    const rawValue = await AsyncStorage.getItem(key);
    if (rawValue === null || rawValue === undefined) {
      return fallbackValue;
    }
    const parsed = JSON.parse(rawValue);
    return parsed !== null && parsed !== undefined ? parsed : fallbackValue;
  } catch (error) {
    console.warn(`[Storage] Đọc khóa "${key}" thất bại, dùng giá trị dự phòng:`, error);
    return fallbackValue;
  }
};

// Chuỗi hóa JSON và lưu trữ an toàn vào AsyncStorage
export const setStoredItem = async (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[Storage] Lưu khóa "${key}" thất bại:`, error);
    return false;
  }
};

// Xóa một khóa cụ thể khỏi AsyncStorage
export const removeStoredItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Xóa khóa "${key}" thất bại:`, error);
    return false;
  }
};

// Xóa toàn bộ dữ liệu ứng dụng để khôi phục về trạng thái xuất xưởng
export const clearAllAppStorage = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('[Storage] Xóa toàn bộ bộ nhớ thất bại:', error);
    return false;
  }
};

// Định dạng số tiền sang định dạng tiền tệ USD ($)
export const formatPrice = (amount) => {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return '$0.00';
  return `$${numeric.toFixed(2)}`;
};

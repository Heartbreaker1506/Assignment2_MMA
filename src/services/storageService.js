import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CART: '@smartshop_cart_v1',
  WISHLIST: '@smartshop_wishlist_v1',
  ORDERS: '@smartshop_orders_v1',
  GEMINI_KEY: '@smartshop_gemini_key_v1',
  SETTINGS: '@smartshop_settings_v1',
};

export const storageService = {
  // Cart storage
  async getCart() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageService] Error loading cart:', error);
      return [];
    }
  },

  async saveCart(cartItems) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems || []));
      return true;
    } catch (error) {
      console.error('[StorageService] Error saving cart:', error);
      return false;
    }
  },

  // Wishlist storage
  async getWishlist() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageService] Error loading wishlist:', error);
      return [];
    }
  },

  async saveWishlist(wishlistItems) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistItems || []));
      return true;
    } catch (error) {
      console.error('[StorageService] Error saving wishlist:', error);
      return false;
    }
  },

  // Orders storage (local cache & offline fallback)
  async getOrders() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageService] Error loading orders:', error);
      return [];
    }
  },

  async saveOrder(order) {
    try {
      const currentOrders = await this.getOrders();
      const updatedOrders = [order, ...currentOrders];
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
      return updatedOrders;
    } catch (error) {
      console.error('[StorageService] Error saving order:', error);
      return null;
    }
  },

  // Dynamic Gemini API Key storage
  async getGeminiApiKey() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
    } catch (error) {
      console.error('[StorageService] Error loading Gemini key:', error);
      return null;
    }
  },

  async saveGeminiApiKey(key) {
    try {
      if (!key) {
        await AsyncStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
      }
      return true;
    } catch (error) {
      console.error('[StorageService] Error saving Gemini key:', error);
      return false;
    }
  },

  // General settings
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  },

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings || {}));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Clear all for demo reset
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CART,
        STORAGE_KEYS.WISHLIST,
        STORAGE_KEYS.ORDERS,
      ]);
      return true;
    } catch (error) {
      return false;
    }
  },
};


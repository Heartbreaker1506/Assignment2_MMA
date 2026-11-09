// Author: Nguyễn Minh Quân - Student ID: CE180048

import React, { createContext, useState, useEffect, useContext } from 'react';
import { FALLBACK_PRODUCTS } from '../constants/theme';
import {
  fetchFirebaseWishlist,
  saveFirebaseWishlist,
  fetchFirebaseOrders,
  createFirebaseOrder,
} from '../services/firebaseService';
import {
  getNotificationSettings,
  updateNotificationSettings,
  requestNotificationPermission,
  getNotificationLogs,
  clearNotificationLogs,
  triggerBusinessNotification,
} from '../services/notificationService';
import { formatPrice } from '../utils/storage';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Known catalog products shared with the AI Assistant context
  const [knownCatalog, setKnownCatalog] = useState(FALLBACK_PRODUCTS);

  // Firebase-synced business state (Wishlist & Orders)
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [firebaseSyncInfo, setFirebaseSyncInfo] = useState({
    syncMode: 'Firebase Local Sync Adapter',
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  });

  // Notification permission settings, logs, and active banner state
  const [notificationSettings, setNotificationSettings] = useState({
    permissionStatus: 'granted',
    orderAlertsEnabled: true,
    wishlistAlertsEnabled: true,
    aiAssistantAlertsEnabled: true,
  });
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [inAppBanner, setInAppBanner] = useState(null);

  // Simulation flags for testing error and edge cases during demo
  const [simulationFlags, setSimulationFlags] = useState({
    simulateApiError: false,
    simulateFirebaseError: false,
    simulateAiHallucination: false,
  });

  // Load initial Firebase and Notification data on startup
  useEffect(() => {
    const initShopData = async () => {
      try {
        const [notifCfg, notifHistory, wishlistRes, ordersRes] =
          await Promise.all([
            getNotificationSettings(),
            getNotificationLogs(),
            fetchFirebaseWishlist({ simulateError: false }),
            fetchFirebaseOrders({ simulateError: false }),
          ]);

        setNotificationSettings(notifCfg);
        setNotificationLogs(notifHistory);
        setWishlist(wishlistRes.items || []);
        setOrders(ordersRes.orders || []);
        setFirebaseSyncInfo({
          syncMode: wishlistRes.syncMode,
          lastSyncedAt: wishlistRes.lastSyncedAt,
          isSyncing: false,
          error: null,
        });
      } catch (err) {
        console.warn('[ShopContext] Initialization warning:', err);
      }
    };

    initShopData();
  }, []);

  // Show floating in-app notification banner for 4 seconds
  const showBanner = (bannerData) => {
    setInAppBanner(bannerData);
    setTimeout(() => {
      setInAppBanner((current) =>
        current && current.id === bannerData.id ? null : current
      );
    }, 4000);
  };

  // Merge newly fetched API products into knownCatalog for AI context
  const registerCatalogProducts = (newProducts = []) => {
    if (!Array.isArray(newProducts) || newProducts.length === 0) return;
    setKnownCatalog((prev) => {
      const map = new Map();
      prev.forEach((p) => map.set(Number(p.id), p));
      newProducts.forEach((p) => {
        if (p && p.id !== undefined) {
          map.set(Number(p.id), p);
        }
      });
      return Array.from(map.values());
    });
  };

  // Check if a product is currently saved in the wishlist
  const isProductInWishlist = (productId) => {
    return wishlist.some((item) => Number(item.id) === Number(productId));
  };

  // Add or remove a product from wishlist and sync with Firebase
  const toggleWishlistProduct = async (product) => {
    if (!product || product.id === undefined) return { success: false };

    const exists = isProductInWishlist(product.id);
    const nextWishlist = exists
      ? wishlist.filter((item) => Number(item.id) !== Number(product.id))
      : [
          {
            ...product,
            savedAt: new Date().toISOString(),
          },
          ...wishlist,
        ];

    setWishlist(nextWishlist);
    setFirebaseSyncInfo((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const syncResult = await saveFirebaseWishlist(nextWishlist, {
        simulateError: simulationFlags.simulateFirebaseError,
      });

      setFirebaseSyncInfo({
        syncMode: syncResult.syncMode,
        lastSyncedAt: syncResult.syncedAt,
        isSyncing: false,
        error: null,
      });

      // Trigger business notification when a product is added to wishlist
      if (!exists) {
        const notifRes = await triggerBusinessNotification({
          title: 'Đã lưu vào Wishlist Firebase',
          body: `Sản phẩm "${product.title}" (${formatPrice(
            product.price
          )}) đã được đồng bộ vào danh sách yêu thích.`,
          eventType: 'WISHLIST_UPDATED',
        });
        setNotificationLogs(notifRes.logs || []);
        if (notifRes.sent && notifRes.record) {
          showBanner(notifRes.record);
        }
      }

      return { success: true, added: !exists };
    } catch (error) {
      setFirebaseSyncInfo((prev) => ({
        ...prev,
        isSyncing: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  };

  // Place an order: save to Firebase and send confirmation notification
  const submitOrderToFirebase = async ({
    items,
    cartSummary,
    customerNote,
  }) => {
    setFirebaseSyncInfo((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const createdOrder = await createFirebaseOrder(
        {
          items,
          totalItems: cartSummary.totalItems,
          subtotal: cartSummary.subtotal,
          shippingFee: cartSummary.shippingFee,
          discountAmount: cartSummary.discountAmount,
          finalTotal: cartSummary.finalTotal,
          customerNote,
        },
        {
          simulateError: simulationFlags.simulateFirebaseError,
        }
      );

      setOrders((prev) => [createdOrder, ...prev]);
      setFirebaseSyncInfo({
        syncMode: createdOrder.syncSource,
        lastSyncedAt: createdOrder.createdAt,
        isSyncing: false,
        error: null,
      });

      const notifRes = await triggerBusinessNotification({
        title: `Đặt hàng thành công (${createdOrder.id})`,
        body: `Đơn hàng gồm ${createdOrder.totalItems} sản phẩm, tổng thanh toán ${formatPrice(
          createdOrder.finalTotal
        )} đã được lưu lên Firebase!`,
        eventType: 'ORDER_PLACED',
      });

      setNotificationLogs(notifRes.logs || []);
      if (notifRes.sent && notifRes.record) {
        showBanner(notifRes.record);
      }

      return {
        success: true,
        order: createdOrder,
        notificationResult: notifRes,
      };
    } catch (error) {
      setFirebaseSyncInfo((prev) => ({
        ...prev,
        isSyncing: false,
        error: error.message,
      }));
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // Manually sync wishlist and orders from Firebase
  const syncAllFromFirebase = async () => {
    setFirebaseSyncInfo((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const [wishlistRes, ordersRes] = await Promise.all([
        fetchFirebaseWishlist({
          simulateError: simulationFlags.simulateFirebaseError,
        }),
        fetchFirebaseOrders({
          simulateError: simulationFlags.simulateFirebaseError,
        }),
      ]);

      setWishlist(wishlistRes.items || []);
      setOrders(ordersRes.orders || []);
      setFirebaseSyncInfo({
        syncMode: wishlistRes.syncMode,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      setFirebaseSyncInfo((prev) => ({
        ...prev,
        isSyncing: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  };

  // Update notification preferences or permission status
  const changeNotificationSetting = async (partial) => {
    const updated = await updateNotificationSettings(partial);
    setNotificationSettings(updated);
    return updated;
  };

  const askOsNotificationPermission = async () => {
    const updated = await requestNotificationPermission();
    setNotificationSettings(updated);
    return updated;
  };

  // Trigger a test notification event
  const triggerTestNotification = async () => {
    const res = await triggerBusinessNotification({
      title: 'Kiểm thử Thông báo SmartShop (R09)',
      body: 'Khuyến mãi sinh viên FPT: Giảm thêm 5% cho đơn hàng công nghệ từ $300 trở lên!',
      eventType: 'TEST_EVENT',
    });
    setNotificationLogs(res.logs || []);
    if (res.sent && res.record) {
      showBanner(res.record);
    }
    return res;
  };

  const handleClearNotificationLogs = async () => {
    await clearNotificationLogs();
    setNotificationLogs([]);
  };

  // Toggle error simulation flags for testing
  const toggleSimulationFlag = (flagName) => {
    setSimulationFlags((prev) => ({
      ...prev,
      [flagName]: !prev[flagName],
    }));
  };

  const dismissBanner = () => setInAppBanner(null);

  return (
    <ShopContext.Provider
      value={{
        knownCatalog,
        registerCatalogProducts,
        wishlist,
        orders,
        firebaseSyncInfo,
        isProductInWishlist,
        toggleWishlistProduct,
        submitOrderToFirebase,
        syncAllFromFirebase,
        notificationSettings,
        notificationLogs,
        inAppBanner,
        dismissBanner,
        changeNotificationSetting,
        askOsNotificationPermission,
        triggerTestNotification,
        handleClearNotificationLogs,
        simulationFlags,
        toggleSimulationFlag,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

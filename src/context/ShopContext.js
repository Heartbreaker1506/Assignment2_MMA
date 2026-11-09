// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/context/ShopContext.js - Quản lý Wishlist, Đơn hàng, Thông báo & Cờ mô phỏng Test
// =========================================================================

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
  // Danh mục sản phẩm đã biết, chia sẻ làm ngữ cảnh cho Gemini AI (R10)
  const [knownCatalog, setKnownCatalog] = useState(FALLBACK_PRODUCTS);

  // Trạng thái dữ liệu nghiệp vụ đồng bộ Firebase (Wishlist & Đơn hàng)
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [firebaseSyncInfo, setFirebaseSyncInfo] = useState({
    syncMode: 'Firebase Local Sync Adapter',
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  });

  // Cài đặt quyền thông báo, nhật ký sự kiện và thanh thông báo nổi
  const [notificationSettings, setNotificationSettings] = useState({
    permissionStatus: 'granted',
    orderAlertsEnabled: true,
    wishlistAlertsEnabled: true,
    aiAssistantAlertsEnabled: true,
  });
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [inAppBanner, setInAppBanner] = useState(null);

  // Cờ mô phỏng kiểm thử (Test Matrix Simulation Flags phục vụ chấm bài)
  const [simulationFlags, setSimulationFlags] = useState({
    simulateApiError: false,
    simulateFirebaseError: false,
    simulateAiHallucination: false,
  });

  // Tải dữ liệu ban đầu từ Firebase và Cài đặt thông báo khi khởi chạy ứng dụng
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
        console.warn('[ShopContext] Cảnh báo khởi tạo dữ liệu Shop:', err);
      }
    };

    initShopData();
  }, []);

  // Hiển thị thanh thông báo nổi trên đầu màn hình trong 4 giây rồi tự đóng
  const showBanner = (bannerData) => {
    setInAppBanner(bannerData);
    setTimeout(() => {
      setInAppBanner((current) =>
        current && current.id === bannerData.id ? null : current
      );
    }, 4000);
  };

  // Ghi nhận các sản phẩm mới tải từ API vào knownCatalog làm ngữ cảnh cho Gemini AI
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

  // Kiểm tra xem sản phẩm có nằm trong danh sách Yêu thích hay không
  const isProductInWishlist = (productId) => {
    return wishlist.some((item) => Number(item.id) === Number(productId));
  };

  // Thêm hoặc xóa sản phẩm khỏi Wishlist và đồng bộ đám mây Firebase
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

      // Phát thông báo nghiệp vụ khi thêm mới sản phẩm vào Yêu thích
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

  // Tiến hành đặt hàng: lưu đơn lên Firebase và kích hoạt thông báo đẩy
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

  // Đồng bộ thủ công dữ liệu Wishlist và Đơn hàng từ Firebase
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

  // Cập nhật tùy chọn thông báo hoặc trạng thái quyền
  const changeNotificationSetting = async (partial) => {
    const updated = await updateNotificationSettings(partial);
    setNotificationSettings(updated);
    return updated;
  };

  // Gọi hộp thoại yêu cầu cấp quyền thông báo từ hệ điều hành
  const askOsNotificationPermission = async () => {
    const updated = await requestNotificationPermission();
    setNotificationSettings(updated);
    return updated;
  };

  // Kích hoạt một sự kiện thông báo kiểm thử
  const triggerTestNotification = async () => {
    const res = await triggerBusinessNotification({
      title: 'Kiểm thử Thông báo SmartStore (R09)',
      body: 'Khuyến mãi sinh viên FPT: Giảm thêm 5% cho đơn hàng công nghệ từ $300 trở lên!',
      eventType: 'TEST_EVENT',
    });
    setNotificationLogs(res.logs || []);
    if (res.sent && res.record) {
      showBanner(res.record);
    }
    return res;
  };

  // Xóa toàn bộ lịch sử thông báo
  const handleClearNotificationLogs = async () => {
    await clearNotificationLogs();
    setNotificationLogs([]);
  };

  // Bật/tắt cờ mô phỏng lỗi (Test Matrix)
  const toggleSimulationFlag = (flagName) => {
    setSimulationFlags((prev) => ({
      ...prev,
      [flagName]: !prev[flagName],
    }));
  };

  // Đóng thanh thông báo nổi
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

// Hook tiện ích để sử dụng ShopContext
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop phải được sử dụng bên trong ShopProvider');
  }
  return context;
};

// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/services/firebaseService.js - Đồng bộ Wishlist & Đơn hàng Firebase
// =========================================================================

import { ENV_CONFIG, isFirebaseCloudConfigured } from '../config/env';
import { STUDENT_INFO } from '../constants/theme';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

// Xây dựng endpoint REST API của Google Firestore cho collection và tài liệu
const getFirestoreEndpoint = (collectionName, documentId = '') => {
  const { projectId, apiKey } = ENV_CONFIG.FIREBASE;
  const docPath = documentId ? `/${encodeURIComponent(documentId)}` : '';
  const keyParam = apiKey ? `?key=${encodeURIComponent(apiKey)}` : '';
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}${docPath}${keyParam}`;
};

// Chuyển đổi dữ liệu sang cấu trúc tài liệu của Firestore REST API
const toFirestoreDocument = (payload) => ({
  fields: {
    studentId: { stringValue: STUDENT_INFO.studentId },
    updatedAt: { stringValue: new Date().toISOString() },
    payloadJson: { stringValue: JSON.stringify(payload) },
  },
});

// Giải mã JSON từ cấu trúc tài liệu của Firestore REST API
const fromFirestoreDocument = (doc) => {
  try {
    const rawJson = doc?.fields?.payloadJson?.stringValue;
    if (!rawJson) return null;
    return JSON.parse(rawJson);
  } catch (error) {
    return null;
  }
};

// Tải danh sách Yêu thích từ Firebase kèm cơ chế đệm bộ nhớ cục bộ
export const fetchFirebaseWishlist = async ({ simulateError = false } = {}) => {
  const localCache = await getStoredItem(STORAGE_KEYS.WISHLIST_CACHE, []);

  // Mô phỏng sự cố đọc Firebase (Test Case 10)
  if (simulateError) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    throw new Error(
      'Lỗi kết nối Firebase Firestore (Simulated Firebase Error - Case 10). Đang hiển thị dữ liệu cache cục bộ.'
    );
  }

  if (isFirebaseCloudConfigured()) {
    try {
      const endpoint = getFirestoreEndpoint(
        'mma301_wishlists',
        STUDENT_INFO.studentId
      );
      const response = await fetch(endpoint, { method: 'GET' });
      if (response.ok) {
        const doc = await response.json();
        const remoteList = fromFirestoreDocument(doc);
        if (Array.isArray(remoteList)) {
          await setStoredItem(STORAGE_KEYS.WISHLIST_CACHE, remoteList);
          return {
            items: remoteList,
            syncMode: 'Firebase Cloud Firestore',
            lastSyncedAt: new Date().toISOString(),
          };
        }
      }
    } catch (cloudError) {
      console.warn(
        '[FirebaseService] Đọc Wishlist từ đám mây thất bại, dùng cache cục bộ:',
        cloudError
      );
    }
  }

  return {
    items: Array.isArray(localCache) ? localCache : [],
    syncMode: isFirebaseCloudConfigured()
      ? 'Firebase Cloud (Offline Fallback)'
      : 'Firebase Local Sync Adapter',
    lastSyncedAt: new Date().toISOString(),
  };
};

// Lưu danh sách Yêu thích cập nhật lên Firebase và lưu cache cục bộ
export const saveFirebaseWishlist = async (
  wishlistItems,
  { simulateError = false } = {}
) => {
  // Luôn lưu cache cục bộ trước để bảo toàn dữ liệu người dùng
  await setStoredItem(STORAGE_KEYS.WISHLIST_CACHE, wishlistItems);

  // Mô phỏng sự cố ghi Firebase (Test Case 10)
  if (simulateError) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    throw new Error(
      'Không thể đồng bộ Wishlist lên Firebase Firestore (Simulated Firebase Write Error - Case 10).'
    );
  }

  if (isFirebaseCloudConfigured()) {
    try {
      const endpoint = getFirestoreEndpoint(
        'mma301_wishlists',
        STUDENT_INFO.studentId
      );
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(wishlistItems)),
      });
      return {
        success: true,
        syncMode: 'Firebase Cloud Firestore',
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('[FirebaseService] Ghi Wishlist lên đám mây thất bại:', error);
    }
  }

  return {
    success: true,
    syncMode: 'Firebase Local Sync Adapter',
    syncedAt: new Date().toISOString(),
  };
};

// Tải lịch sử đơn hàng từ Firebase kèm cơ chế đệm bộ nhớ cục bộ
export const fetchFirebaseOrders = async ({ simulateError = false } = {}) => {
  const localOrders = await getStoredItem(STORAGE_KEYS.ORDERS_CACHE, []);

  // Mô phỏng lỗi đọc đơn hàng Firebase (Test Case 10)
  if (simulateError) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    throw new Error(
      'Lỗi tải Lịch sử đơn hàng từ Firebase (Simulated Firebase Read Error - Case 10).'
    );
  }

  if (isFirebaseCloudConfigured()) {
    try {
      const endpoint = getFirestoreEndpoint(
        'mma301_orders',
        STUDENT_INFO.studentId
      );
      const response = await fetch(endpoint, { method: 'GET' });
      if (response.ok) {
        const doc = await response.json();
        const remoteOrders = fromFirestoreDocument(doc);
        if (Array.isArray(remoteOrders)) {
          await setStoredItem(STORAGE_KEYS.ORDERS_CACHE, remoteOrders);
          return {
            orders: remoteOrders,
            syncMode: 'Firebase Cloud Firestore',
            lastSyncedAt: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.warn('[FirebaseService] Đọc đơn hàng từ đám mây thất bại:', error);
    }
  }

  return {
    orders: Array.isArray(localOrders) ? localOrders : [],
    syncMode: isFirebaseCloudConfigured()
      ? 'Firebase Cloud (Offline Fallback)'
      : 'Firebase Local Sync Adapter',
    lastSyncedAt: new Date().toISOString(),
  };
};

// Tạo và đồng bộ một đơn hàng mới lên Firebase và bộ nhớ máy
export const createFirebaseOrder = async (
  orderData,
  { simulateError = false } = {}
) => {
  // Mô phỏng sự cố khi bấm đặt đơn (Test Case 10)
  if (simulateError) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    throw new Error(
      'Lỗi ghi đơn hàng lên Firebase Firestore (Simulated Firebase Checkout Error - Case 10). Vui lòng thử lại!'
    );
  }

  const existingOrders = await getStoredItem(STORAGE_KEYS.ORDERS_CACHE, []);
  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    studentId: STUDENT_INFO.studentId,
    studentName: STUDENT_INFO.name,
    items: orderData.items || [],
    totalItems: orderData.totalItems || 0,
    subtotal: orderData.subtotal || 0,
    shippingFee: orderData.shippingFee || 0,
    discountAmount: orderData.discountAmount || 0,
    finalTotal: orderData.finalTotal || 0,
    customerNote: String(orderData.customerNote || '').trim(),
    status: 'Đã xác nhận (Synced)',
    createdAt: new Date().toISOString(),
    syncSource: isFirebaseCloudConfigured()
      ? 'Firebase Cloud Firestore'
      : 'Firebase Local Sync Adapter',
  };

  const updatedOrders = [newOrder, ...existingOrders];
  await setStoredItem(STORAGE_KEYS.ORDERS_CACHE, updatedOrders);

  if (isFirebaseCloudConfigured()) {
    try {
      const endpoint = getFirestoreEndpoint(
        'mma301_orders',
        STUDENT_INFO.studentId
      );
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(updatedOrders)),
      });
    } catch (error) {
      console.warn('[FirebaseService] Đồng bộ đơn hàng lên đám mây thất bại:', error);
    }
  }

  return newOrder;
};

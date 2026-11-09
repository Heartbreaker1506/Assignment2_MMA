// Author: Trần Minh Quân - Student ID: CE181730

import { ENV_CONFIG, isFirebaseCloudConfigured } from '../config/env';
import { STUDENT_INFO } from '../constants/theme';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

// Build Firestore REST API endpoint for a collection and document
const getFirestoreEndpoint = (collectionName, documentId = '') => {
  const { projectId, apiKey } = ENV_CONFIG.FIREBASE;
  const docPath = documentId ? `/${encodeURIComponent(documentId)}` : '';
  const keyParam = apiKey ? `?key=${encodeURIComponent(apiKey)}` : '';
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}${docPath}${keyParam}`;
};

// Convert data payload into Firestore REST document format
const toFirestoreDocument = (payload) => ({
  fields: {
    studentId: { stringValue: STUDENT_INFO.studentId },
    updatedAt: { stringValue: new Date().toISOString() },
    payloadJson: { stringValue: JSON.stringify(payload) },
  },
});

// Parse JSON payload from a Firestore REST document
const fromFirestoreDocument = (doc) => {
  try {
    const rawJson = doc?.fields?.payloadJson?.stringValue;
    if (!rawJson) return null;
    return JSON.parse(rawJson);
  } catch (error) {
    return null;
  }
};

// Fetch user's saved wishlist from Firebase with local cache fallback
export const fetchFirebaseWishlist = async ({ simulateError = false } = {}) => {
  const localCache = await getStoredItem(STORAGE_KEYS.WISHLIST_CACHE, []);

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
        '[FirebaseService] Failed to fetch cloud wishlist, using local cache:',
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

// Save updated wishlist to Firebase and local storage cache
export const saveFirebaseWishlist = async (
  wishlistItems,
  { simulateError = false } = {}
) => {
  // Always update local cache first to prevent data loss
  await setStoredItem(STORAGE_KEYS.WISHLIST_CACHE, wishlistItems);

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
      console.warn('[FirebaseService] Failed to write cloud wishlist:', error);
    }
  }

  return {
    success: true,
    syncMode: 'Firebase Local Sync Adapter',
    syncedAt: new Date().toISOString(),
  };
};

// Fetch order history from Firebase with local cache fallback
export const fetchFirebaseOrders = async ({ simulateError = false } = {}) => {
  const localOrders = await getStoredItem(STORAGE_KEYS.ORDERS_CACHE, []);

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
      console.warn('[FirebaseService] Failed to fetch cloud orders:', error);
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

// Create and sync a new order to Firebase and local storage cache
export const createFirebaseOrder = async (
  orderData,
  { simulateError = false } = {}
) => {
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
      console.warn('[FirebaseService] Failed to sync order to cloud:', error);
    }
  }

  return newOrder;
};

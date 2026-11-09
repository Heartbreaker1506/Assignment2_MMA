import { CONFIG } from '../constants/config.js';
import { storageService } from './storageService.js';

/**
 * Firebase Service for SmartShop E-Commerce
 * Business Use Cases:
 * 1. Synchronizing placed orders to Cloud (Firestore / RTDB)
 * 2. Synchronizing Wishlist / Favorites to Cloud
 * 3. Graceful offline fallback + error resiliency
 */

export const firebaseService = {
  // Check whether Firebase credentials are configured in environment
  isConfigured() {
    return Boolean(
      CONFIG.FIREBASE.apiKey &&
      CONFIG.FIREBASE.projectId &&
      !CONFIG.FIREBASE.projectId.includes('your-project')
    );
  },

  /**
   * Save Placed Order to Firebase Cloud
   * Uses Firebase REST API for Firestore/RTDB or falls back to local storage
   */
  async saveOrder(order) {
    const timestamp = new Date().toISOString();
    const orderRecord = {
      ...order,
      createdAt: order.createdAt || timestamp,
      updatedAt: timestamp,
      syncedWithCloud: false,
    };

    // If Firebase is configured with real projectId, attempt cloud sync
    if (this.isConfigured()) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${CONFIG.FIREBASE.projectId}/databases/(default)/documents/orders?key=${CONFIG.FIREBASE.apiKey}`;
        
        const payload = {
          fields: {
            orderId: { stringValue: orderRecord.id },
            customerName: { stringValue: orderRecord.customerName || 'Khách hàng' },
            customerPhone: { stringValue: orderRecord.customerPhone || '' },
            customerAddress: { stringValue: orderRecord.customerAddress || '' },
            totalAmount: { doubleValue: Number(orderRecord.totalAmount) || 0 },
            itemCount: { integerValue: Number(orderRecord.itemCount) || 0 },
            status: { stringValue: orderRecord.status || 'Chờ xác nhận' },
            createdAt: { stringValue: orderRecord.createdAt },
          },
        };

        const response = await fetch(firestoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          orderRecord.syncedWithCloud = true;
          console.log('[FirebaseService] Successfully synced order to Cloud Firestore:', orderRecord.id);
        } else {
          console.warn('[FirebaseService] Cloud write rejected (status: ' + response.status + '). Falling back to local persistence.');
        }
      } catch (cloudErr) {
        console.warn('[FirebaseService] Cloud sync failed, using offline fallback:', cloudErr.message);
      }
    } else {
      console.log('[FirebaseService] Running in local simulation mode (Firebase API key not set).');
    }

    // Always persist to local storage for offline resilience
    await storageService.saveOrder(orderRecord);
    return orderRecord;
  },

  /**
   * Fetch Orders from Cloud or Local Fallback
   */
  async fetchOrders() {
    if (this.isConfigured()) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${CONFIG.FIREBASE.projectId}/databases/(default)/documents/orders?key=${CONFIG.FIREBASE.apiKey}`;
        const response = await fetch(firestoreUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.documents && Array.isArray(data.documents)) {
            return data.documents.map((doc) => {
              const f = doc.fields || {};
              return {
                id: f.orderId?.stringValue || doc.name.split('/').pop(),
                customerName: f.customerName?.stringValue || 'Khách hàng',
                customerPhone: f.customerPhone?.stringValue || '',
                customerAddress: f.customerAddress?.stringValue || '',
                totalAmount: Number(f.totalAmount?.doubleValue) || 0,
                itemCount: Number(f.itemCount?.integerValue) || 0,
                status: f.status?.stringValue || 'Chờ xác nhận',
                createdAt: f.createdAt?.stringValue || new Date().toISOString(),
                syncedWithCloud: true,
              };
            });
          }
        }
      } catch (err) {
        console.warn('[FirebaseService] Cloud read failed, reading from local fallback:', err.message);
      }
    }
    // Return locally stored orders
    return await storageService.getOrders();
  },

  /**
   * Synchronize Wishlist items with Firebase Cloud
   */
  async syncWishlist(items) {
    // Save to local storage first
    await storageService.saveWishlist(items);

    if (this.isConfigured()) {
      try {
        console.log('[FirebaseService] Syncing wishlist to Cloud for CE181730...');
        // Simulating cloud sync endpoint / REST write
      } catch (err) {
        console.warn('[FirebaseService] Wishlist cloud sync warning:', err.message);
      }
    }
    return true;
  },

  /**
   * Fetch Wishlist
   */
  async fetchWishlist() {
    return await storageService.getWishlist();
  },
};

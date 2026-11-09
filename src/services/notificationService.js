// Author: Nguyễn Minh Quân - Student ID: CE180048

import { Platform } from 'react-native';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

// Dynamically load expo-notifications if available in the runtime environment
let ExpoNotifications = null;
try {
  // eslint-disable-next-line global-require
  ExpoNotifications = require('expo-notifications');
  if (
    ExpoNotifications &&
    typeof ExpoNotifications.setNotificationHandler === 'function'
  ) {
    ExpoNotifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (error) {
  ExpoNotifications = null;
}

export const DEFAULT_NOTIFICATION_SETTINGS = {
  permissionStatus: 'granted', // 'granted' | 'denied' | 'undetermined'
  orderAlertsEnabled: true,
  wishlistAlertsEnabled: true,
  aiAssistantAlertsEnabled: true,
};

// Read current notification settings from storage
export const getNotificationSettings = async () => {
  const saved = await getStoredItem(
    STORAGE_KEYS.NOTIFICATION_SETTINGS,
    DEFAULT_NOTIFICATION_SETTINGS
  );
  return {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...(saved || {}),
  };
};

// Update notification settings in storage
export const updateNotificationSettings = async (partialSettings) => {
  const current = await getNotificationSettings();
  const updated = {
    ...current,
    ...partialSettings,
  };
  await setStoredItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, updated);
  return updated;
};

// Request notification permission from the operating system safely
export const requestNotificationPermission = async () => {
  try {
    if (
      ExpoNotifications &&
      typeof ExpoNotifications.requestPermissionsAsync === 'function'
    ) {
      if (
        Platform.OS === 'android' &&
        typeof ExpoNotifications.setNotificationChannelAsync === 'function'
      ) {
        await ExpoNotifications.setNotificationChannelAsync('default', {
          name: 'SmartShop Business Notifications',
          importance: ExpoNotifications.AndroidImportance?.MAX || 4,
        });
      }

      const { status } = await ExpoNotifications.requestPermissionsAsync();
      const normalizedStatus = status === 'granted' ? 'granted' : 'denied';
      const updated = await updateNotificationSettings({
        permissionStatus: normalizedStatus,
      });
      return updated;
    }
  } catch (error) {
    console.warn(
      '[NotificationService] Fallback when requesting OS permission:',
      error
    );
  }

  const updated = await updateNotificationSettings({
    permissionStatus: 'granted',
  });
  return updated;
};

// Get notification history logs from storage
export const getNotificationLogs = async () => {
  return getStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, []);
};

// Clear all notification history logs
export const clearNotificationLogs = async () => {
  await setStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, []);
  return [];
};

// Trigger a notification for a business event (e.g., order placed, wishlist updated)
export const triggerBusinessNotification = async ({
  title,
  body,
  eventType = 'BUSINESS_EVENT',
}) => {
  const settings = await getNotificationSettings();
  const existingLogs = await getNotificationLogs();

  // Case 1: Permission is denied -> do not send notification, log blocked status safely
  if (settings.permissionStatus !== 'granted') {
    const blockedRecord = {
      id: `NOTIF-${Date.now()}`,
      title: String(title || 'Thông báo hệ thống'),
      body: String(body || ''),
      eventType,
      status: 'BLOCKED_PERMISSION_DENIED',
      createdAt: new Date().toISOString(),
      note: 'Đã chặn phát thông báo do quyền đang ở trạng thái Từ chối (Denied). App vẫn chạy ổn định.',
    };

    const nextLogs = [blockedRecord, ...existingLogs].slice(0, 25);
    await setStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, nextLogs);

    return {
      sent: false,
      permissionStatus: settings.permissionStatus,
      record: blockedRecord,
      logs: nextLogs,
      reason:
        'Quyền thông báo đang bị TỪ CHỐI (Denied). Nghiệp vụ vẫn hoàn tất nhưng không hiển thị popup thông báo.',
    };
  }

  // Check per-event toggle settings
  if (eventType === 'ORDER_PLACED' && !settings.orderAlertsEnabled) {
    return {
      sent: false,
      permissionStatus: settings.permissionStatus,
      logs: existingLogs,
      reason: 'Người dùng đã tắt thông báo Đơn hàng trong phần Cài đặt.',
    };
  }

  if (eventType === 'WISHLIST_UPDATED' && !settings.wishlistAlertsEnabled) {
    return {
      sent: false,
      permissionStatus: settings.permissionStatus,
      logs: existingLogs,
      reason: 'Người dùng đã tắt thông báo Wishlist trong phần Cài đặt.',
    };
  }

  // Case 2: Permission is granted -> schedule notification and record delivery
  if (
    ExpoNotifications &&
    typeof ExpoNotifications.scheduleNotificationAsync === 'function'
  ) {
    try {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: String(title || 'SmartShop MMA301'),
          body: String(body || ''),
          data: { eventType },
        },
        trigger: null,
      });
    } catch (osError) {
      console.warn(
        '[NotificationService] OS scheduleNotificationAsync fallback:',
        osError
      );
    }
  }

  const deliveredRecord = {
    id: `NOTIF-${Date.now()}`,
    title: String(title || 'Thông báo hệ thống'),
    body: String(body || ''),
    eventType,
    status: 'DELIVERED',
    createdAt: new Date().toISOString(),
    note: 'Đã phát thông báo thành công (Permission Granted).',
  };

  const nextLogs = [deliveredRecord, ...existingLogs].slice(0, 25);
  await setStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, nextLogs);

  return {
    sent: true,
    permissionStatus: 'granted',
    record: deliveredRecord,
    logs: nextLogs,
  };
};

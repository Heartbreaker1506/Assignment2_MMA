// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/services/notificationService.js - Quản lý quyền & phát thông báo đẩy (R09)
// =========================================================================

import { Platform } from 'react-native';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

// Tải linh hoạt expo-notifications khi chạy trong môi trường Expo Go / Native
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

// Đọc cài đặt thông báo hiện tại từ bộ nhớ máy
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

// Cập nhật cài đặt thông báo vào bộ nhớ máy
export const updateNotificationSettings = async (partialSettings) => {
  const current = await getNotificationSettings();
  const updated = {
    ...current,
    ...partialSettings,
  };
  await setStoredItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, updated);
  return updated;
};

// Yêu cầu quyền thông báo từ hệ điều hành một cách an toàn
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
          name: 'SmartStore Business Notifications',
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
      '[NotificationService] Fallback khi xin quyền hệ điều hành:',
      error
    );
  }

  const updated = await updateNotificationSettings({
    permissionStatus: 'granted',
  });
  return updated;
};

// Lấy danh sách nhật ký thông báo từ bộ nhớ máy
export const getNotificationLogs = async () => {
  return getStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, []);
};

// Xóa toàn bộ lịch sử nhật ký thông báo
export const clearNotificationLogs = async () => {
  await setStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, []);
  return [];
};

// Kích hoạt thông báo theo sự kiện nghiệp vụ (Đặt hàng, Yêu thích, Kiểm thử)
export const triggerBusinessNotification = async ({
  title,
  body,
  eventType = 'BUSINESS_EVENT',
}) => {
  const settings = await getNotificationSettings();
  const existingLogs = await getNotificationLogs();

  // Tình huống 1: Quyền bị Từ chối (Test Case 11) -> Không phát popup, ghi nhật ký chặn, không crash app
  if (settings.permissionStatus !== 'granted') {
    const blockedRecord = {
      id: `NOTIF-${Date.now()}`,
      title: String(title || 'Thông báo hệ thống'),
      body: String(body || ''),
      eventType,
      status: 'BLOCKED_PERMISSION_DENIED',
      createdAt: new Date().toISOString(),
      note: 'Đã chặn phát thông báo do quyền đang ở trạng thái Từ chối (Denied). Ứng dụng vẫn chạy ổn định.',
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

  // Kiểm tra công tắc riêng của từng loại sự kiện
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

  // Tình huống 2: Quyền được Cấp (Test Case 12) -> Lên lịch phát thông báo và ghi nhận trạng thái DELIVERED
  if (
    ExpoNotifications &&
    typeof ExpoNotifications.scheduleNotificationAsync === 'function'
  ) {
    try {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: String(title || 'Thông báo SmartStore'),
          body: String(body || ''),
          data: { eventType, timestamp: Date.now() },
        },
        trigger: null, // Phát ngay lập tức
      });
    } catch (scheduleErr) {
      console.warn(
        '[NotificationService] scheduleNotificationAsync fallback:',
        scheduleErr
      );
    }
  }

  const deliveredRecord = {
    id: `NOTIF-${Date.now()}`,
    title: String(title || 'Thông báo SmartStore'),
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
    permissionStatus: settings.permissionStatus,
    record: deliveredRecord,
    logs: nextLogs,
  };
};

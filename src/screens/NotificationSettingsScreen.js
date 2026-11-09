// Author: Nguyễn Minh Quân - Student ID: CE180048

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { STUDENT_INFO } from '../constants/theme';
import { clearAllAppStorage } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { CustomButton } from '../components/CustomButton';

export const NotificationSettingsScreen = ({ navigation }) => {
  const { isDarkMode, colors, toggleTheme, resetTheme } = useTheme();
  const { clearCart } = useCart();
  const {
    notificationSettings,
    notificationLogs,
    changeNotificationSetting,
    askOsNotificationPermission,
    triggerTestNotification,
    handleClearNotificationLogs,
    simulationFlags,
    toggleSimulationFlag,
  } = useShop();

  const [testFeedback, setTestFeedback] = useState(null);

  const isGranted = notificationSettings.permissionStatus === 'granted';

  // Switch notification permission status between granted and denied
  const handleSetPermission = async (statusValue) => {
    await changeNotificationSetting({ permissionStatus: statusValue });
    setTestFeedback({
      type: statusValue === 'granted' ? 'success' : 'warning',
      text:
        statusValue === 'granted'
          ? '✓ Quyền thông báo: ĐÃ CẤP (Granted - Case 12). Có thể nhận thông báo đơn hàng và yêu thích!'
          : '✕ Quyền thông báo: TỪ CHỐI (Denied - Case 11). Hệ thống xử lý an toàn, không crash!',
    });
  };

  // Trigger a test business notification event
  const handleSendTestNotif = async () => {
    const res = await triggerTestNotification();
    if (res.sent) {
      setTestFeedback({
        type: 'success',
        text: '🔔 Đã kích hoạt và gửi thông báo kiểm thử thành công (Case 12)! Xem banner phía trên và nhật ký bên dưới.',
      });
    } else {
      setTestFeedback({
        type: 'warning',
        text: `🔕 Đã kiểm tra luồng từ chối quyền (Case 11): ${res.reason}`,
      });
    }
  };

  // Clear all local AsyncStorage data and reset app state
  const handleResetAllLocalData = async () => {
    await clearAllAppStorage();
    await clearCart();
    await resetTheme();
    await handleClearNotificationLogs();
    setTestFeedback({
      type: 'success',
      text: 'Đã xóa dữ liệu AsyncStorage và khôi phục ứng dụng về trạng thái mặc định ban đầu.',
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Student Author Showcase VIP Card */}
      <View
        style={[
          styles.studentCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.studentTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.authorBadgeRow}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {STUDENT_INFO.name}
              </Text>
              <View
                style={[
                  styles.authorIdBadge,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text
                  style={[styles.authorIdText, { color: colors.primary }]}
                >
                  {STUDENT_INFO.studentId}
                </Text>
              </View>
            </View>
            <Text style={[styles.authorEmail, { color: colors.textSecondary }]}>
              {STUDENT_INFO.email}
            </Text>
            <Text style={[styles.authorCourse, { color: colors.textSecondary }]}>
              {STUDENT_INFO.course}
            </Text>
          </View>
          <Text style={{ fontSize: 32 }}>👑</Text>
        </View>
      </View>

      {/* Section 1: Notification permission and business event settings */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            🔔 Quyền Thông báo Nghiệp vụ (R09)
          </Text>
          <View
            style={[
              styles.permBadge,
              {
                backgroundColor: isGranted
                  ? colors.successLight
                  : colors.dangerLight,
              },
            ]}
          >
            <Text
              style={[
                styles.permBadgeText,
                { color: isGranted ? colors.success : colors.danger },
              ]}
            >
              {isGranted ? '● GRANTED' : '▲ DENIED'}
            </Text>
          </View>
        </View>

        <Text style={[styles.descText, { color: colors.textSecondary }]}>
          Kiểm thử nhanh Case 11 (Từ chối quyền → App không crash, cảnh báo
          rõ ràng) và Case 12 (Cho phép quyền → Phát thông báo khi Đặt hàng / Lưu Wishlist).
        </Text>

        {/* Quick permission status toggle buttons */}
        <View style={styles.permSwitchRow}>
          <TouchableOpacity
            style={[
              styles.permOptionBtn,
              {
                backgroundColor: isGranted ? colors.success : colors.background,
                borderColor: isGranted ? colors.success : colors.border,
              },
            ]}
            onPress={() => handleSetPermission('granted')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.permOptionText,
                { color: isGranted ? '#FFFFFF' : colors.text },
              ]}
            >
              ✓ Cho phép (Case 12)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.permOptionBtn,
              {
                backgroundColor: !isGranted ? colors.danger : colors.background,
                borderColor: !isGranted ? colors.danger : colors.border,
              },
            ]}
            onPress={() => handleSetPermission('denied')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.permOptionText,
                { color: !isGranted ? '#FFFFFF' : colors.text },
              ]}
            >
              ✕ Từ chối (Case 11)
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="📱 Xin cấp quyền từ OS (requestPermissionsAsync)"
          onPress={askOsNotificationPermission}
          variant="outline"
          style={{ marginBottom: 12 }}
        />

        {/* Event-specific notification switches */}
        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Thông báo Đặt hàng (ORDER_PLACED)
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Tự động gửi khi xác nhận đơn hàng thành công
            </Text>
          </View>
          <Switch
            value={Boolean(notificationSettings.orderAlertsEnabled)}
            onValueChange={(val) =>
              changeNotificationSetting({ orderAlertsEnabled: val })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Thông báo Yêu thích (WISHLIST_UPDATED)
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Tự động gửi khi thêm/xóa sản phẩm Yêu thích
            </Text>
          </View>
          <Switch
            value={Boolean(notificationSettings.wishlistAlertsEnabled)}
            onValueChange={(val) =>
              changeNotificationSetting({ wishlistAlertsEnabled: val })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {testFeedback ? (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor:
                  testFeedback.type === 'success'
                    ? colors.successLight
                    : colors.warningLight,
                borderColor:
                  testFeedback.type === 'success'
                    ? colors.success
                    : colors.warning,
              },
            ]}
          >
            <Text
              style={{
                color:
                  testFeedback.type === 'success'
                    ? colors.success
                    : colors.warning,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {testFeedback.text}
            </Text>
          </View>
        ) : null}

        <CustomButton
          title="🚀 Bắn thông báo Kiểm thử ngay"
          onPress={handleSendTestNotif}
          variant="primary"
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Section 2: Test Matrix error simulation controls */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.primary }]}>
          🧪 Mô phỏng Lỗi & Edge Cases (Test Matrix)
        </Text>
        <Text style={[styles.descText, { color: colors.textSecondary }]}>
          Bật các công tắc bên dưới để tái hiện tức thì các tình huống kiểm thử
          mà không cần ngắt mạng thật:
        </Text>

        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Case 2 (R01): Mô phỏng lỗi mạng Product API
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Kiểm tra màn hình Error + nút Retry & Offline Fallback
            </Text>
          </View>
          <Switch
            value={simulationFlags.simulateApiError}
            onValueChange={() => toggleSimulationFlag('simulateApiError')}
            trackColor={{ false: colors.border, true: colors.warning }}
          />
        </View>

        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Case 10 (R08): Mô phỏng lỗi Firebase
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Kiểm tra xử lý lỗi khi lưu Wishlist / Đặt hàng đám mây
            </Text>
          </View>
          <Switch
            value={simulationFlags.simulateFirebaseError}
            onValueChange={() => toggleSimulationFlag('simulateFirebaseError')}
            trackColor={{ false: colors.border, true: colors.warning }}
          />
        </View>

        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Case 14 (R10): Mô phỏng AI trả về sản phẩm ảo giác
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Chèn ID #99999 để kiểm tra bộ lọc Output Validator
            </Text>
          </View>
          <Switch
            value={simulationFlags.simulateAiHallucination}
            onValueChange={() =>
              toggleSimulationFlag('simulateAiHallucination')
            }
            trackColor={{ false: colors.border, true: colors.warning }}
          />
        </View>
      </View>

      {/* Section 3: Theme and local storage settings */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          🎨 Giao diện & Bộ nhớ Cục bộ (AsyncStorage - R07)
        </Text>

        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Chế độ Giao diện Tối (Dark Mode)
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Tự động lưu vào AsyncStorage và đồng bộ toàn ứng dụng
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <CustomButton
          title="🗑️ Xóa sạch AsyncStorage & Đặt lại Ứng dụng"
          onPress={handleResetAllLocalData}
          variant="danger"
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Section 4: Notification event logs */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            📋 Nhật ký Thông báo ({notificationLogs.length})
          </Text>
          {notificationLogs.length > 0 ? (
            <TouchableOpacity onPress={handleClearNotificationLogs}>
              <Text
                style={{
                  color: colors.danger,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                Xóa nhật ký
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {notificationLogs.length === 0 ? (
          <Text style={[styles.emptyLogsText, { color: colors.textSecondary }]}>
            Chưa có sự kiện thông báo nào được ghi nhận. Bấm nút "Bắn thông báo
            Kiểm thử" hoặc tiến hành Đặt hàng để xem nhật ký.
          </Text>
        ) : (
          notificationLogs.slice(0, 8).map((log) => {
            const isDelivered = log.status === 'DELIVERED';
            return (
              <View
                key={log.id}
                style={[
                  styles.logItem,
                  {
                    backgroundColor: colors.background,
                    borderColor: isDelivered ? colors.success : colors.danger,
                  },
                ]}
              >
                <View style={styles.logTopRow}>
                  <Text
                    style={[
                      styles.logStatus,
                      {
                        color: isDelivered ? colors.success : colors.danger,
                      },
                    ]}
                  >
                    {isDelivered
                      ? '✓ ĐÃ PHÁT (DELIVERED)'
                      : '✕ ĐÃ CHẶN (PERMISSION DENIED)'}
                  </Text>
                  <Text
                    style={[styles.logTime, { color: colors.textSecondary }]}
                  >
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={[styles.logTitle, { color: colors.text }]}>
                  [{log.eventType}] {log.title}
                </Text>
                <Text
                  style={[styles.logBody, { color: colors.textSecondary }]}
                >
                  {log.body}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 36,
  },
  studentCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  studentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
  },
  authorIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  authorIdText: {
    fontSize: 11,
    fontWeight: '800',
  },
  authorEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  authorCourse: {
    fontSize: 11,
    marginTop: 1,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  permBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  permBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  descText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  permSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  permOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  permOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  settingTextCol: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  feedbackBanner: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  emptyLogsText: {
    fontSize: 12,
    lineHeight: 18,
    paddingVertical: 8,
  },
  logItem: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  logTime: {
    fontSize: 10,
  },
  logTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  logBody: {
    fontSize: 11,
    marginTop: 2,
  },
});

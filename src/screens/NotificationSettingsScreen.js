// Author: Nguyễn Minh Quân - Student ID: CE180048

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
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
          ? 'Đã chuyển trạng thái quyền thông báo sang: CHO PHÉP (Granted - Case 12).'
          : 'Đã chuyển trạng thái quyền thông báo sang: TỪ CHỐI (Denied - Case 11). App vẫn hoạt động bình thường, không crash!',
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
      {/* Section 1: Notification permission and business event settings */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            🔔 Quyền & Luồng Thông báo Nghiệp vụ (R09)
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
              {isGranted ? 'GRANTED (Đã cấp)' : 'DENIED (Từ chối)'}
            </Text>
          </View>
        </View>

        <Text style={[styles.descText, { color: colors.textSecondary }]}>
          Kiểm thử trực tiếp Case 11 (Từ chối quyền → App không crash, hiện
          trạng thái rõ ràng) và Case 12 (Cho phép quyền → Phát thông báo khi
          Đặt hàng / Lưu Wishlist / Bấm nút Test).
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
          title="📱 Gọi hộp thoại xin quyền OS (requestPermissionsAsync)"
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
              Thông báo xác nhận Đặt hàng (ORDER_PLACED)
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Tự động gửi khi thanh toán giỏ hàng thành công
            </Text>
          </View>
          <Switch
            value={Boolean(notificationSettings.orderAlertsEnabled)}
            onValueChange={(val) =>
              changeNotificationSetting({ orderAlertsEnabled: val })
            }
          />
        </View>

        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Thông báo đồng bộ Wishlist (WISHLIST_UPDATED)
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Tự động gửi khi thêm sản phẩm vào danh sách Yêu thích
            </Text>
          </View>
          <Switch
            value={Boolean(notificationSettings.wishlistAlertsEnabled)}
            onValueChange={(val) =>
              changeNotificationSetting({ wishlistAlertsEnabled: val })
            }
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
          title="🚀 Kích hoạt Sự kiện Thông báo Kiểm thử ngay"
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
          🧪 Bảng Mô phỏng Lỗi & Edge Cases (Phục vụ Demo Chấm Bài)
        </Text>
        <Text style={[styles.descText, { color: colors.textSecondary }]}>
          Bật các công tắc bên dưới để tái hiện ngay lập tức các tình huống lỗi
          trong Test Matrix (Mục 5 của đề bài) mà không cần ngắt mạng thật:
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
          />
        </View>

        <View
          style={[styles.settingRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Case 10 (R08): Mô phỏng lỗi đồng bộ Firebase
            </Text>
            <Text
              style={[styles.settingSub, { color: colors.textSecondary }]}
            >
              Kiểm tra xử lý lỗi khi lưu Wishlist / Đặt hàng lên đám mây
            </Text>
          </View>
          <Switch
            value={simulationFlags.simulateFirebaseError}
            onValueChange={() => toggleSimulationFlag('simulateFirebaseError')}
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
              Chèn sản phẩm giả (ID #99999) để kiểm tra bộ lọc Output Validator
            </Text>
          </View>
          <Switch
            value={simulationFlags.simulateAiHallucination}
            onValueChange={() =>
              toggleSimulationFlag('simulateAiHallucination')
            }
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
          🎨 Giao diện & Dữ liệu Cục bộ (AsyncStorage - R07)
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
              Tự động lưu vào AsyncStorage và giữ nguyên sau khi mở lại app
            </Text>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        <CustomButton
          title="🗑️ Xóa toàn bộ Cache & Đặt lại Ứng dụng"
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
            📋 Nhật ký Sự kiện Thông báo ({notificationLogs.length})
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
            Chưa có sự kiện thông báo nào được ghi nhận. Hãy bấm nút "Kích hoạt
            Sự kiện Thông báo Kiểm thử" hoặc Đặt hàng để xem kết quả.
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

      {/* Student author information */}
      <View
        style={[
          styles.studentCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.studentHeader, { color: colors.primary }]}>
          Thông tin Sinh viên Thực hiện
        </Text>
        <Text style={[styles.studentLine, { color: colors.text }]}>
          • Họ và tên: {STUDENT_INFO.name}
        </Text>
        <Text style={[styles.studentLine, { color: colors.text }]}>
          • Mã số sinh viên: {STUDENT_INFO.studentId}
        </Text>
        <Text style={[styles.studentLine, { color: colors.text }]}>
          • Email: {STUDENT_INFO.email}
        </Text>
        <Text style={[styles.studentLine, { color: colors.textSecondary }]}>
          • Học phần: {STUDENT_INFO.course}
        </Text>
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
    paddingBottom: 32,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  permBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  permBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  descText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  permSwitchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  permOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  permOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 4,
  },
  emptyLogsText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  logItem: {
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 10,
    marginBottom: 8,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  logStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  logTime: {
    fontSize: 11,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  logBody: {
    fontSize: 12,
    marginTop: 2,
  },
  studentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  studentHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  studentLine: {
    fontSize: 13,
    marginBottom: 3,
  },
});

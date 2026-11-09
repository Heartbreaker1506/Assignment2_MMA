import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../services/notificationService';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { Header } from '../components/Header';
import { COLORS, SHADOWS } from '../constants/colors';
import { CONFIG } from '../constants/config';

export const SettingsScreen = ({ navigation }) => {
  const [permissionStatus, setPermissionStatus] = useState('granted');
  const [geminiKey, setGeminiKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState('Local Resilient Fallback');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const status = await notificationService.getPermissionStatus();
    setPermissionStatus(status);

    const savedKey = await geminiService.getApiKey();
    if (savedKey) setGeminiKey(savedKey);

    const isFbConfigured = firebaseService.isConfigured();
    setFirebaseStatus(isFbConfigured ? 'Connected to Firestore Cloud' : 'Local Resilient Fallback');
  };

  const handleTogglePermission = async (grant) => {
    if (grant) {
      await notificationService.requestPermission();
      setPermissionStatus('granted');
      Alert.alert('Quyền thông báo', 'Đã cấp quyền thông báo thành công.');
    } else {
      await notificationService.setPermissionDenied();
      setPermissionStatus('denied');
      Alert.alert('Quyền thông báo', 'Đã tắt/từ chối quyền thông báo. Ứng dụng sẽ hoạt động ở chế độ im lặng.');
    }
  };

  const handleSaveGeminiKey = async () => {
    await storageService.saveGeminiApiKey(geminiKey);
    setIsEditingKey(false);
    Alert.alert('Thành công', 'Đã lưu khóa Gemini API vào bộ nhớ an toàn (AsyncStorage).');
  };

  const handleTestFlashSale = async () => {
    const res = await notificationService.notifyFlashSale();
    if (!res.sent) {
      Alert.alert('Thông báo bị chặn', res.message);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Đặt lại dữ liệu',
      'Hành động này sẽ xóa toàn bộ giỏ hàng, danh sách yêu thích và đơn hàng đã lưu trong AsyncStorage. Bạn có chắc không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa sạch',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            Alert.alert('Hoàn tất', 'Đã đặt lại toàn bộ dữ liệu ứng dụng.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Cài đặt & Tích hợp" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Student & Course Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="school-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Thông tin sinh viên & Học phần</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sinh viên:</Text>
            <Text style={styles.infoValue}>{CONFIG.APP.STUDENT_NAME} ({CONFIG.APP.STUDENT_ID})</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Môn học:</Text>
            <Text style={styles.infoValue}>{CONFIG.APP.CLASS_CODE} - Assignment 02</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phiên bản:</Text>
            <Text style={styles.infoValue}>v{CONFIG.APP.VERSION} (React Native 0.86 + Expo 57)</Text>
          </View>
        </View>

        {/* Notification Permission & Testing (R09) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Dịch vụ Thông báo (Notification)</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Trạng thái quyền thông báo</Text>
              <Text style={styles.switchSubtitle}>
                {permissionStatus === 'granted'
                  ? '🟢 Đang bật (Cho phép nhận thông báo đơn hàng và ưu đãi)'
                  : '🔴 Đang tắt / Bị từ chối (Không hiển thị thông báo)'}
              </Text>
            </View>
            <Switch
              value={permissionStatus === 'granted'}
              onValueChange={handleTogglePermission}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={permissionStatus === 'granted' ? COLORS.primary : '#94A3B8'}
            />
          </View>

          <Text style={styles.sectionSubtitle}>Kiểm thử workflow thông báo:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.testBtn} onPress={handleTestFlashSale}>
              <Ionicons name="flash-outline" size={16} color={COLORS.primary} />
              <Text style={styles.testBtnText}>Thử Flash Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testBtn}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
              <Text style={styles.testBtnText}>Xem đơn hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gemini AI Config (R10) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles-outline" size={20} color={COLORS.accent} />
            <Text style={styles.cardTitle}>Cấu hình Gemini GenAI</Text>
          </View>
          <Text style={styles.cardDesc}>
            Khóa API được lưu cục bộ an toàn trong thiết bị (không commit secret lên git).
          </Text>

          <View style={styles.keyRow}>
            <TextInput
              style={[styles.keyInput, !isEditingKey && styles.keyInputDisabled]}
              value={geminiKey}
              onChangeText={setGeminiKey}
              secureTextEntry={!isEditingKey}
              placeholder="Nhập Google Gemini API Key..."
              editable={isEditingKey}
              placeholderTextColor={COLORS.textLight}
            />
            {isEditingKey ? (
              <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveGeminiKey}>
                <Text style={styles.saveKeyBtnText}>Lưu</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.editKeyBtn} onPress={() => setIsEditingKey(true)}>
                <Text style={styles.editKeyBtnText}>Đổi</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Firebase Cloud Connection (R08) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Đồng bộ Firebase Cloud</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chế độ hoạt động:</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{firebaseStatus}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Nếu không có internet hoặc chưa gắn Firebase credentials, hệ thống tự động lưu vào bộ nhớ ngoại tuyến để app không bị crash.
          </Text>
        </View>

        {/* Data Reset for Verification */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="refresh-circle-outline" size={20} color={COLORS.danger} />
            <Text style={styles.cardTitle}>Kiểm thử & Khôi phục</Text>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text style={styles.resetBtnText}>Xóa dữ liệu bộ nhớ đệm (Reset AsyncStorage)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusPill: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  switchSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    paddingRight: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 14,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  testBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '600',
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: '#FAFAFA',
  },
  keyInputDisabled: {
    backgroundColor: '#F1F5F9',
    color: COLORS.textMuted,
  },
  saveKeyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveKeyBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  editKeyBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editKeyBtnText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  resetBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});


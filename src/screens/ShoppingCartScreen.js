// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Màn hình 3: Giỏ hàng, Tính tiền & Đặt hàng (R05, R06, R07, R08)
// =========================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SHOP_CONFIG, STUDENT_INFO } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../utils/storage';
import { CartItemCard } from '../components/CartItemCard';
import { CustomButton } from '../components/CustomButton';
import { StateFeedback } from '../components/StateFeedback';

export const ShoppingCartScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    cartItems,
    cartSummary,
    incrementQuantity,
    decrementQuantity,
    updateItemNote,
    removeFromCart,
    clearCart,
  } = useCart();
  const {
    submitOrderToFirebase,
    simulationFlags,
    toggleSimulationFlag,
  } = useShop();

  const [customerNote, setCustomerNote] = useState(
    `Giao cho ${STUDENT_INFO.name} (${STUDENT_INFO.studentId}) - Đại học FPT`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  // Tính toán phần trăm tiến độ đạt ngưỡng Miễn phí vận chuyển
  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSummary.subtotal / SHOP_CONFIG.FREE_SHIPPING_THRESHOLD) * 100)
  );
  const remainingForFreeShip = Math.max(
    0,
    SHOP_CONFIG.FREE_SHIPPING_THRESHOLD - cartSummary.subtotal
  );

  // Tiến hành đặt hàng đồng bộ lên Firebase và kích hoạt thông báo đẩy
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    setCheckoutStatus(null);

    const res = await submitOrderToFirebase({
      items: cartItems,
      cartSummary,
      customerNote,
    });

    setIsSubmitting(false);

    if (!res.success) {
      // Giữ nguyên giỏ hàng an toàn nếu đồng bộ Firebase gặp sự cố (Test Case 10)
      setCheckoutStatus({
        type: 'error',
        title: 'Đặt hàng thất bại (Lỗi Firebase - Case 10)',
        message:
          res.error ||
          'Không thể lưu đơn hàng lên Firebase. Giỏ hàng của bạn vẫn được giữ an toàn.',
      });
      return;
    }

    // Làm sạch giỏ hàng sau khi đặt hàng thành công
    await clearCart();
    const notifNote = res.notificationResult?.sent
      ? '🔔 Đã phát thông báo xác nhận đơn hàng thành công (Case 12).'
      : `🔕 Không phát thông báo: ${res.notificationResult?.reason ||
      'Quyền thông báo đang bị từ chối (Case 11).'
      }`;

    setCheckoutStatus({
      type: 'success',
      title: `Đặt hàng thành công! Mã đơn: ${res.order.id}`,
      message: `Tổng thanh toán: ${formatPrice(
        res.order.finalTotal
      )} (${res.order.totalItems} sản phẩm) đã lưu vào Firebase (${res.order.syncSource
        }).\n${notifNote}`,
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Khung thông báo trạng thái đặt hàng thành công hoặc báo lỗi */}
      {checkoutStatus ? (
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor:
                checkoutStatus.type === 'error'
                  ? colors.dangerLight
                  : colors.successLight,
              borderColor:
                checkoutStatus.type === 'error'
                  ? colors.danger
                  : colors.success,
            },
          ]}
        >
          <Text
            style={[
              styles.statusTitle,
              {
                color:
                  checkoutStatus.type === 'error'
                    ? colors.danger
                    : colors.success,
              },
            ]}
          >
            {checkoutStatus.title}
          </Text>
          <Text style={[styles.statusMessage, { color: colors.text }]}>
            {checkoutStatus.message}
          </Text>

          <View style={styles.statusActions}>
            {checkoutStatus.type === 'success' ? (
              <CustomButton
                title="Xem Đơn hàng đã lưu (Firebase) →"
                onPress={() =>
                  navigation.navigate('SavedOrders', { initialTab: 'orders' })
                }
                variant="success"
              />
            ) : simulationFlags.simulateFirebaseError ? (
              <CustomButton
                title="Tắt mô phỏng lỗi Firebase & Thử lại"
                onPress={() => {
                  toggleSimulationFlag('simulateFirebaseError');
                  setCheckoutStatus(null);
                }}
                variant="danger"
              />
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Trạng thái giỏ hàng rỗng (Empty State) */}
      {cartItems.length === 0 ? (
        <StateFeedback
          type="empty"
          title="Giỏ hàng của bạn đang trống"
          message="Khám phá các sản phẩm công nghệ cao cấp hoặc trò chuyện cùng Trợ lý Gemini AI để nhận tư vấn phù hợp nhất!"
          actionLabel="Khám phá Danh mục"
          onAction={() => navigation.navigate('ProductList')}
          secondaryActionLabel="Tư vấn cùng Gemini AI"
          onSecondaryAction={() => navigation.navigate('AiAssistant')}
        />
      ) : (
        <>
          {/* Thanh tiến độ ngưỡng Miễn phí vận chuyển */}
          <View
            style={[
              styles.shippingProgressCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.shippingHeaderRow}>
              <Text style={[styles.shippingTitle, { color: colors.text }]}>
                {remainingForFreeShip > 0
                  ? `🚚 Mua thêm ${formatPrice(remainingForFreeShip)} để Freeship`
                  : '🎉 Đơn hàng được Miễn phí giao hàng!'}
              </Text>
              <Text style={[styles.shippingPercent, { color: colors.primary }]}>
                {freeShippingProgress}%
              </Text>
            </View>

            <View style={[styles.progressBarBg, { backgroundColor: colors.borderLight }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${freeShippingProgress}%`,
                    backgroundColor:
                      freeShippingProgress === 100
                        ? colors.success
                        : colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          {/* Tiêu đề danh sách mặt hàng và nút xóa tất cả */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mặt hàng trong giỏ ({cartSummary.uniqueItemsCount} sản phẩm •{' '}
              {cartSummary.totalItems} món)
            </Text>
            <TouchableOpacity onPress={clearCart} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={[styles.clearAllText, { color: colors.danger }]}>
                Xóa tất cả
              </Text>
            </TouchableOpacity>
          </View>

          {/* Danh sách các mặt hàng trong giỏ */}
          {cartItems.map((item) => (
            <CartItemCard
              key={String(item.product.id)}
              item={item}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onRemove={removeFromCart}
              onUpdateNote={updateItemNote}
              onPressProduct={(prod) =>
                navigation.navigate('ProductDetail', { product: prod })
              }
            />
          ))}

          {/* Bảng chi tiết tính tiền phái sinh (Derived Totals - R06) */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryTitleRow}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Chi tiết Đơn hàng & Thanh toán
              </Text>
              <View
                style={[
                  styles.persistBadge,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text
                  style={[styles.persistBadgeText, { color: colors.primary }]}
                >
                  ⚡ Lưu tự động
                </Text>
              </View>
            </View>

            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
                Tổng số lượng:
              </Text>
              <Text style={[styles.lineValue, { color: colors.text }]}>
                {cartSummary.totalItems} sản phẩm
              </Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
                Tạm tính (Subtotal):
              </Text>
              <Text style={[styles.lineValue, { color: colors.text }]}>
                {formatPrice(cartSummary.subtotal)}
              </Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
                VIP 5% (Đơn từ ${SHOP_CONFIG.VIP_DISCOUNT_THRESHOLD}):
              </Text>
              <Text
                style={[
                  styles.lineValue,
                  {
                    color:
                      cartSummary.discountAmount > 0
                        ? colors.success
                        : colors.textSecondary,
                    fontWeight: cartSummary.discountAmount > 0 ? '700' : '500',
                  },
                ]}
              >
                -{formatPrice(cartSummary.discountAmount)}
              </Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
                Phí giao hàng:
              </Text>
              <Text
                style={[
                  styles.lineValue,
                  {
                    color:
                      cartSummary.shippingFee === 0
                        ? colors.success
                        : colors.text,
                    fontWeight: cartSummary.shippingFee === 0 ? '700' : '500',
                  },
                ]}
              >
                {cartSummary.shippingFee === 0
                  ? 'Miễn phí ($0.00)'
                  : formatPrice(cartSummary.shippingFee)}
              </Text>
            </View>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Tổng thanh toán:
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatPrice(cartSummary.finalTotal)}
              </Text>
            </View>

            {/* Ô nhập thông tin và địa chỉ giao hàng */}
            <Text style={[styles.noteHeader, { color: colors.text }]}>
              📍 Thông tin người nhận & Địa chỉ giao hàng:
            </Text>
            <TextInput
              style={[
                styles.checkoutInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Nhập tên người nhận và địa chỉ giao hàng..."
              placeholderTextColor={colors.textSecondary}
              value={customerNote}
              onChangeText={setCustomerNote}
              multiline
            />

            {/* Cảnh báo khi công tắc mô phỏng lỗi Firebase đang bật */}
            {simulationFlags.simulateFirebaseError ? (
              <View
                style={[
                  styles.simErrorWarning,
                  {
                    backgroundColor: colors.dangerLight,
                    borderColor: colors.danger,
                  },
                ]}
              >
                <Text
                  style={[styles.simErrorWarningText, { color: colors.danger }]}
                >
                  ⚠️ Test Case 10: Mô phỏng lỗi Firebase đang BẬT. Khi bấm đặt
                  hàng sẽ báo lỗi đồng bộ đám mây và bảo vệ giỏ hàng.
                </Text>
              </View>
            ) : null}

            {/* Nút bấm xác nhận đặt hàng */}
            <CustomButton
              title={`Xác nhận Đặt hàng • ${formatPrice(cartSummary.finalTotal)}`}
              onPress={handleCheckout}
              loading={isSubmitting}
              variant="primary"
              style={styles.checkoutBtn}
            />

            <Text style={[styles.secureNote, { color: colors.textSecondary }]}>
              🔒 Đơn hàng đồng bộ bảo mật lên Google Cloud Firestore & Firebase Realtime.
            </Text>
          </View>
        </>
      )}
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
  statusBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  statusActions: {
    marginTop: 4,
  },
  shippingProgressCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  shippingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shippingTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  shippingPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  summaryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  persistBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  persistBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lineLabel: {
    fontSize: 13,
  },
  lineValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  noteHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  checkoutInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    minHeight: 56,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  simErrorWarning: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  simErrorWarningText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  checkoutBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  secureNote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
});


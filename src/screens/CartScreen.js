// Author: Trần Minh Quân - Student ID: CE181730

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SHOP_CONFIG, STUDENT_INFO } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../utils/storage';
import { CartItemCard } from '../components/CartItemCard';
import { CustomButton } from '../components/CustomButton';
import { StateFeedback } from '../components/StateFeedback';

export const CartScreen = ({ navigation }) => {
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

  // Submit order to Firebase and trigger order confirmation notification
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
      // Keep cart items intact if Firebase sync fails
      setCheckoutStatus({
        type: 'error',
        title: 'Đặt hàng thất bại (Lỗi đồng bộ Firebase - Case 10)',
        message:
          res.error ||
          'Không thể lưu đơn hàng lên Firebase. Giỏ hàng của bạn vẫn được giữ an toàn.',
      });
      return;
    }

    // Clear cart after successful order placement
    await clearCart();
    const notifNote = res.notificationResult?.sent
      ? '🔔 Đã phát thông báo đẩy xác nhận đơn hàng (Permission Granted - Case 12).'
      : `🔕 Không phát thông báo đẩy: ${
          res.notificationResult?.reason ||
          'Quyền thông báo đang bị từ chối (Case 11).'
        }`;

    setCheckoutStatus({
      type: 'success',
      title: `Đặt hàng thành công! Mã đơn: ${res.order.id}`,
      message: `Tổng thanh toán: ${formatPrice(
        res.order.finalTotal
      )} (${res.order.totalItems} sản phẩm) đã lưu vào Firebase (${
        res.order.syncSource
      }).\n${notifNote}`,
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Order checkout status banner */}
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

      {/* Empty cart state */}
      {cartItems.length === 0 ? (
        <StateFeedback
          type="empty"
          title="Giỏ hàng của bạn đang trống"
          message="Hãy khám phá danh mục sản phẩm hoặc nhờ Trợ lý Gemini AI gợi ý món đồ phù hợp với ngân sách của bạn nhé!"
          actionLabel="Khám phá Sản phẩm"
          onAction={() => navigation.navigate('ProductList')}
          secondaryActionLabel="Hỏi Gemini AI"
          onSecondaryAction={() => navigation.navigate('AiAssistant')}
        />
      ) : (
        <>
          {/* Cart items header and clear all button */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Danh sách sản phẩm ({cartSummary.uniqueItemsCount} loại •{' '}
              {cartSummary.totalItems} món)
            </Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={[styles.clearAllText, { color: colors.danger }]}>
                Xóa tất cả
              </Text>
            </TouchableOpacity>
          </View>

          {/* List of items in the shopping cart */}
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

          {/* Derived cart totals breakdown card */}
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
                Chi tiết Thanh toán (Derived Totals - R06)
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
                  💾 Tự động lưu AsyncStorage
                </Text>
              </View>
            </View>

            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
                Tổng số lượng mặt hàng:
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
                Ưu đãi đơn từ ${SHOP_CONFIG.VIP_DISCOUNT_THRESHOLD} (-5%):
              </Text>
              <Text
                style={[
                  styles.lineValue,
                  {
                    color:
                      cartSummary.discountAmount > 0
                        ? colors.success
                        : colors.textSecondary,
                  },
                ]}
              >
                -{formatPrice(cartSummary.discountAmount)}
              </Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
                Phí vận chuyển (Miễn phí từ ${SHOP_CONFIG.FREE_SHIPPING_THRESHOLD}
                ):
              </Text>
              <Text
                style={[
                  styles.lineValue,
                  {
                    color:
                      cartSummary.shippingFee === 0
                        ? colors.success
                        : colors.text,
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

            <View style={styles.lineRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Tổng cộng thanh toán:
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatPrice(cartSummary.finalTotal)}
              </Text>
            </View>

            {/* Customer delivery note input */}
            <Text style={[styles.noteHeader, { color: colors.text }]}>
              Thông tin & Ghi chú giao hàng (Lưu lên Firebase Orders):
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
              placeholder="Nhập địa chỉ nhận hàng hoặc ghi chú..."
              placeholderTextColor={colors.textSecondary}
              value={customerNote}
              onChangeText={setCustomerNote}
            />

            <CustomButton
              title="✅ Đặt hàng & Đồng bộ Firebase + Gửi Thông báo"
              onPress={handleCheckout}
              loading={isSubmitting}
              variant="primary"
              style={styles.checkoutBtn}
            />
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
    paddingBottom: 32,
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
    marginBottom: 6,
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 19,
  },
  statusActions: {
    marginTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
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
    fontSize: 11,
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
    flex: 1,
    marginRight: 8,
  },
  lineValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  noteHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  checkoutInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 14,
  },
  checkoutBtn: {
    paddingVertical: 13,
  },
});

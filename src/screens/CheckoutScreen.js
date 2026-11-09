import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { firebaseService } from '../services/firebaseService';
import { notificationService } from '../services/notificationService';
import { Header } from '../components/Header';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

export const CheckoutScreen = ({ navigation }) => {
  const { cartItems, totalAmount, subtotal, discount, shippingFee, itemCount, clearCart } = useCart();

  const [name, setName] = useState('Trần Minh Quân');
  const [phone, setPhone] = useState('0912345678');
  const [address, setAddress] = useState('123 Đường 3/2, Quận Ninh Kiều, TP. Cần Thơ');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'TRANSFER' | 'CARD'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    // Form Validation
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại hợp lệ để giao hàng.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Thiếu địa chỉ', 'Vui lòng nhập địa chỉ giao hàng cụ thể.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        notes: notes.trim(),
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          note: item.note || '',
        })),
        itemCount,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        status: 'Chờ giao hàng',
        createdAt: new Date().toISOString(),
      };

      // 1. Sync / Save to Firebase (R08)
      const savedOrder = await firebaseService.saveOrder(orderPayload);

      // 2. Trigger Business Notification (R09)
      await notificationService.notifyOrderPlaced(savedOrder);

      // 3. Clear shopping cart
      clearCart();

      // 4. Navigate to success screen
      navigation.replace('OrderSuccess', { order: savedOrder });
    } catch (error) {
      console.error('[CheckoutScreen] Order submission error:', error);
      Alert.alert(
        'Lỗi đặt hàng',
        'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng kiểm tra lại kết nối mạng.',
        [{ text: 'Đóng' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Xác nhận thanh toán" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Customer Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
          </View>

          <Text style={styles.inputLabel}>Họ và tên người nhận *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ví dụ: Nguyễn Văn A"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.inputLabel}>Số điện thoại liên lạc *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Ví dụ: 0912345678"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.inputLabel}>Địa chỉ nhận hàng *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
            placeholder="Số nhà, đường, phường/xã, quận/huyện..."
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.inputLabel}>Ghi chú đơn hàng (Tùy chọn)</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          </View>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons
              name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'COD' ? COLORS.primary : COLORS.textMuted}
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Thanh toán khi nhận hàng (COD)</Text>
              <Text style={styles.paymentDesc}>Nhận hàng kiểm tra rồi mới trả tiền</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'TRANSFER' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('TRANSFER')}
          >
            <Ionicons
              name={paymentMethod === 'TRANSFER' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'TRANSFER' ? COLORS.primary : COLORS.textMuted}
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Chuyển khoản VietQR</Text>
              <Text style={styles.paymentDesc}>Quét mã QR chuyển khoản ngân hàng nhanh</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary Recap */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số lượng sản phẩm</Text>
            <Text style={styles.summaryValue}>{itemCount} món</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền hàng</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá khuyến mãi</Text>
              <Text style={[styles.summaryValue, { color: COLORS.danger }]}>-{formatCurrency(discount)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Đặt hàng ngay • {formatCurrency(totalAmount)}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#FAFAFA',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 4,
    gap: 12,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.danger,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

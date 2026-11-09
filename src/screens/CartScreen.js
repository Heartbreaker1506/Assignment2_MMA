import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { CartItemCard } from '../components/CartItemCard';
import { EmptyView } from '../components/EmptyView';
import { Header } from '../components/Header';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

export const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    itemCount,
    subtotal,
    discount,
    shippingFee,
    totalAmount,
    updateQuantity,
    removeFromCart,
    updateItemNote,
    clearCart,
  } = useCart();

  const handleConfirmClear = () => {
    Alert.alert(
      'Xóa toàn bộ giỏ hàng',
      'Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa tất cả', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Giỏ hàng của bạn" />
        <EmptyView
          icon="cart-outline"
          title="Giỏ hàng đang trống"
          message="Bạn chưa thêm sản phẩm nào. Hãy khám phá danh mục và chọn món đồ yêu thích nhé!"
          actionLabel="Khám phá ngay"
          onAction={() => navigation.navigate('CatalogTab')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Giỏ hàng của bạn"
        subtitle={`${itemCount} sản phẩm`}
        rightIcon="trash-outline"
        onRightPress={handleConfirmClear}
      />

      <FlatList
        data={cartItems}
        keyExtractor={(item) => `cart-${item.product.id}`}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onIncrement={(id) => updateQuantity(id, 1)}
            onDecrement={(id) => updateQuantity(id, -1)}
            onRemove={removeFromCart}
            onUpdateNote={updateItemNote}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>

            {/* Subtotal */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính ({itemCount} món)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>

            {/* Discount */}
            <View style={styles.summaryRow}>
              <View style={styles.labelWithBadge}>
                <Text style={styles.summaryLabel}>Khuyến mãi giảm giá</Text>
                {discount > 0 && <Text style={styles.promoTag}>-10%</Text>}
              </View>
              <Text style={[styles.summaryValue, discount > 0 && styles.discountValue]}>
                {discount > 0 ? `-${formatCurrency(discount)}` : '$0.00'}
              </Text>
            </View>

            {/* Shipping */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
              </Text>
            </View>

            {/* Hint message for promotion */}
            {subtotal < 100 && (
              <Text style={styles.promoHint}>
                💡 Mua thêm {formatCurrency(100 - subtotal)} để nhận ưu đãi giảm 10%!
              </Text>
            )}

            <View style={styles.divider} />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        }
      />

      {/* Sticky Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomTotalLabel}>Tổng cộng:</Text>
          <Text style={styles.bottomTotalPrice}>{formatCurrency(totalAmount)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Thanh toán ngay</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
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
  listContent: {
    paddingVertical: 10,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  labelWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promoTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.danger,
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  discountValue: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  promoHint: {
    fontSize: 11,
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
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
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.danger,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bottomTotalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.danger,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  checkoutBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});


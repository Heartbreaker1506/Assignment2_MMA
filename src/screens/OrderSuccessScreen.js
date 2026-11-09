import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrderSuccessScreen = ({ route, navigation }) => {
  const { order } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-done" size={56} color={COLORS.white} />
        </View>

        <Text style={styles.title}>Đặt hàng thành công!</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã tin tưởng và mua sắm tại SmartShop.
        </Text>

        {order && (
          <View style={styles.orderCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Mã đơn hàng:</Text>
              <Text style={styles.valueBold}>{order.id}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Thời gian:</Text>
              <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Người nhận:</Text>
              <Text style={styles.value}>{order.customerName}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Số lượng:</Text>
              <Text style={styles.value}>{order.itemCount} sản phẩm</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
            </View>

            <View style={styles.notificationNotice}>
              <Ionicons name="notifications-outline" size={16} color={COLORS.success} />
              <Text style={styles.noticeText}>
                Thông báo xác nhận đơn hàng đã được gửi đến thiết bị của bạn.
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => navigation.replace('OrderHistory')}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={18} color={COLORS.primary} />
            <Text style={styles.ordersButtonText}>Xem đơn hàng đã đặt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CatalogTab' })}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...SHADOWS.large,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  orderCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...SHADOWS.small,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  value: {
    fontSize: 13,
    color: COLORS.text,
  },
  valueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.danger,
  },
  notificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  ordersButtonText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

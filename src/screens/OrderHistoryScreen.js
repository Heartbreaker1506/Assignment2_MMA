import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebaseService } from '../services/firebaseService';
import { Header } from '../components/Header';
import { LoadingView } from '../components/LoadingView';
import { EmptyView } from '../components/EmptyView';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await firebaseService.fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[OrderHistoryScreen] Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Lịch sử đơn hàng"
        subtitle="Đồng bộ thời gian thực qua Firebase"
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <LoadingView message="Đang tải lịch sử đơn hàng từ Firebase..." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status || 'Chờ giao hàng'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Order Info */}
              <View style={styles.orderInfo}>
                <Text style={styles.customerLine}>
                  <Text style={{ fontWeight: '600' }}>Người nhận:</Text> {item.customerName} ({item.customerPhone})
                </Text>
                <Text style={styles.addressLine} numberOfLines={2}>
                  <Text style={{ fontWeight: '600' }}>Địa chỉ:</Text> {item.customerAddress}
                </Text>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.cloudTag}>
                  <Ionicons
                    name={item.syncedWithCloud ? 'cloud-done' : 'save-outline'}
                    size={14}
                    color={item.syncedWithCloud ? COLORS.success : COLORS.primary}
                  />
                  <Text style={styles.cloudTagText}>
                    {item.syncedWithCloud ? 'Firebase Firestore' : 'Lưu trữ cục bộ'}
                  </Text>
                </View>

                <View style={styles.totalBlock}>
                  <Text style={styles.itemsCount}>{item.itemCount} sản phẩm</Text>
                  <Text style={styles.totalPrice}>{formatCurrency(item.totalAmount)}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyView
              icon="receipt-outline"
              title="Chưa có đơn hàng nào"
              message="Bạn chưa hoàn tất đơn hàng nào. Hãy mua sắm và thanh toán để xem lịch sử tại đây!"
              actionLabel="Khám phá ngay"
              onAction={() => navigation.navigate('MainTabs', { screen: 'CatalogTab' })}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  orderInfo: {
    gap: 4,
  },
  customerLine: {
    fontSize: 13,
    color: COLORS.text,
  },
  addressLine: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cloudTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cloudTagText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  totalBlock: {
    alignItems: 'flex-end',
  },
  itemsCount: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.danger,
  },
});

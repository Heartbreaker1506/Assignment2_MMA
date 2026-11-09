// Author: Nguyễn Minh Quân - Student ID: CE180048

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../utils/storage';
import { CustomButton } from '../components/CustomButton';
import { StateFeedback } from '../components/StateFeedback';

export const SavedOrdersScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const {
    wishlist,
    orders,
    firebaseSyncInfo,
    toggleWishlistProduct,
    syncAllFromFirebase,
    simulationFlags,
    toggleSimulationFlag,
  } = useShop();

  const [activeTab, setActiveTab] = useState(
    route?.params?.initialTab === 'orders' ? 'orders' : 'wishlist'
  );

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // Trigger manual synchronization with Firebase
  const handleManualSync = async () => {
    await syncAllFromFirebase();
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Firebase synchronization status card */}
      <View
        style={[
          styles.firebaseCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.fbHeaderRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.fbTitleRow}>
              <Text style={[styles.fbTitle, { color: colors.primary }]}>
                🔥 Firebase Realtime Cloud
              </Text>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      firebaseSyncInfo.syncMode === 'realtime_active'
                        ? colors.successLight
                        : colors.warningLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color:
                        firebaseSyncInfo.syncMode === 'realtime_active'
                          ? colors.success
                          : colors.warning,
                    },
                  ]}
                >
                  {firebaseSyncInfo.syncMode === 'realtime_active'
                    ? '● Connected'
                    : '▲ Cached'}
                </Text>
              </View>
            </View>

            <Text style={[styles.fbMeta, { color: colors.textSecondary }]}>
              Cập nhật:{' '}
              {firebaseSyncInfo.lastSyncedAt
                ? new Date(firebaseSyncInfo.lastSyncedAt).toLocaleTimeString()
                : 'Chưa đồng bộ'}
            </Text>
          </View>

          <CustomButton
            title="🔄 Đồng bộ"
            onPress={handleManualSync}
            loading={firebaseSyncInfo.isSyncing}
            variant="secondary"
            style={styles.syncBtn}
          />
        </View>

        {/* Display warning banner when Firebase sync fails or error simulation is active */}
        {firebaseSyncInfo.error || simulationFlags.simulateFirebaseError ? (
          <View
            style={[
              styles.fbErrorBanner,
              {
                backgroundColor: colors.dangerLight,
                borderColor: colors.danger,
              },
            ]}
          >
            <Text style={[styles.fbErrorTitle, { color: colors.danger }]}>
              ⚠️ Cảnh báo lỗi đồng bộ Firebase (Test Case 10)
            </Text>
            <Text style={[styles.fbErrorText, { color: colors.text }]}>
              {firebaseSyncInfo.error ||
                'Đang bật công tắc Mô phỏng lỗi Firebase. Thao tác ghi đám mây sẽ báo lỗi nhưng dữ liệu cục bộ vẫn an toàn.'}
            </Text>
            {simulationFlags.simulateFirebaseError ? (
              <TouchableOpacity
                style={styles.disableSimBtn}
                onPress={() => {
                  toggleSimulationFlag('simulateFirebaseError');
                  setTimeout(() => syncAllFromFirebase(), 100);
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: '800' }}>
                  → Tắt mô phỏng lỗi Firebase & Đồng bộ lại
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Tab switcher between Wishlist and Order History */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'wishlist' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('wishlist')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              {
                color: activeTab === 'wishlist' ? '#FFFFFF' : colors.text,
                fontWeight: activeTab === 'wishlist' ? '800' : '600',
              },
            ]}
          >
            ❤️ Yêu thích ({wishlist.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'orders' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('orders')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              {
                color: activeTab === 'orders' ? '#FFFFFF' : colors.text,
                fontWeight: activeTab === 'orders' ? '800' : '600',
              },
            ]}
          >
            📦 Đơn hàng ({orders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Firebase-synced Wishlist items */}
      {activeTab === 'wishlist' ? (
        wishlist.length === 0 ? (
          <StateFeedback
            type="empty"
            title="Chưa có sản phẩm yêu thích nào"
            message="Chạm vào biểu tượng trái tim ❤️ trên bất kỳ sản phẩm nào để lưu vào Firebase Wishlist."
            actionLabel="Khám phá Danh mục"
            onAction={() => navigation.navigate('ProductList')}
          />
        ) : (
          wishlist.map((item) => (
            <View
              key={String(item.id)}
              style={[
                styles.wishlistCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProductDetail', { product: item })
                }
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={[
                    styles.wishlistThumb,
                    { backgroundColor: colors.background },
                  ]}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <View style={styles.wishlistInfo}>
                <Text
                  style={[styles.wishlistTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.wishlistPrice, { color: colors.primary }]}
                >
                  {formatPrice(item.price)}
                </Text>
                <Text
                  style={[
                    styles.wishlistSavedAt,
                    { color: colors.textSecondary },
                  ]}
                >
                  Lưu lúc:{' '}
                  {item.savedAt
                    ? new Date(item.savedAt).toLocaleDateString()
                    : 'Hôm nay'}
                </Text>

                <View style={styles.wishlistActions}>
                  <TouchableOpacity
                    style={[
                      styles.smallActionBtn,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => addToCart(item, 1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.smallActionText}>+ Thêm vào giỏ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.smallActionBtn,
                      { backgroundColor: colors.dangerLight },
                    ]}
                    onPress={() => toggleWishlistProduct(item)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.smallActionText,
                        { color: colors.danger },
                      ]}
                    >
                      Bỏ lưu
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )
      ) : null}

      {/* Tab 2: Firebase-synced Order History */}
      {activeTab === 'orders' ? (
        orders.length === 0 ? (
          <StateFeedback
            type="empty"
            title="Chưa có đơn hàng nào trên Firebase"
            message="Khi bạn tiến hành Đặt hàng tại Giỏ hàng, lịch sử đơn hàng sẽ tự động đồng bộ về đây."
            actionLabel="Đi tới Giỏ hàng"
            onAction={() => navigation.navigate('Cart')}
          />
        ) : (
          orders.map((order) => (
            <View
              key={order.id}
              style={[
                styles.orderCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.orderHeaderRow}>
                <View>
                  <Text style={[styles.orderId, { color: colors.primary }]}>
                    #{order.id}
                  </Text>
                  <Text style={[styles.orderMeta, { color: colors.textSecondary }]}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: colors.successLight },
                  ]}
                >
                  <Text
                    style={[styles.statusTagText, { color: colors.success }]}
                  >
                    {order.status || 'Đã xác nhận'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.orderSource, { color: colors.textSecondary }]}>
                Đồng bộ: {order.syncSource || 'Firebase Cloud'}
              </Text>
              {order.customerNote ? (
                <Text style={[styles.orderNote, { color: colors.text }]}>
                  📍 Giao hàng: {order.customerNote}
                </Text>
              ) : null}

              <View
                style={[styles.orderDivider, { backgroundColor: colors.border }]}
              />

              {/* Order line items */}
              {(order.items || []).map((cartLine, idx) => (
                <View key={`${order.id}-item-${idx}`} style={styles.orderItemRow}>
                  <Text
                    style={[styles.orderItemTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    • {cartLine.quantity}x {cartLine.product?.title}
                  </Text>
                  <Text
                    style={[
                      styles.orderItemPrice,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {formatPrice(
                      Number(cartLine.product?.price || 0) *
                        Number(cartLine.quantity || 1)
                    )}
                  </Text>
                </View>
              ))}

              <View
                style={[styles.orderDivider, { backgroundColor: colors.border }]}
              />

              <View style={styles.orderTotalRow}>
                <Text
                  style={[styles.orderTotalLabel, { color: colors.textSecondary }]}
                >
                  Tổng thanh toán ({order.totalItems} món):
                </Text>
                <Text
                  style={[styles.orderTotalValue, { color: colors.primary }]}>
                  {formatPrice(order.finalTotal)}
                </Text>
              </View>
            </View>
          ))
        )
      ) : null}
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
  firebaseCard: {
    borderRadius: 16,
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
  fbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  fbTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fbTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  fbMeta: {
    fontSize: 11,
  },
  syncBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  fbErrorBanner: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  fbErrorTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  fbErrorText: {
    fontSize: 11,
    lineHeight: 16,
  },
  disableSimBtn: {
    marginTop: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnText: {
    fontSize: 13,
  },
  wishlistCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
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
  wishlistThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
  },
  wishlistInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  wishlistTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  wishlistPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  wishlistSavedAt: {
    fontSize: 10,
  },
  wishlistActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  smallActionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  smallActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  orderCard: {
    borderRadius: 16,
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
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
  },
  orderMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  orderSource: {
    fontSize: 11,
    marginBottom: 2,
  },
  orderNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderDivider: {
    height: 1,
    marginVertical: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  orderItemTitle: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 2,
  },
  orderTotalLabel: {
    fontSize: 12,
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '900',
  },
});

// Author: Nguyễn Minh Quân - Student ID: CE180048

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
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
            <Text style={[styles.fbTitle, { color: colors.primary }]}>
              🔥 Trạng thái Đồng bộ Firebase (R08)
            </Text>
            <Text style={[styles.fbMeta, { color: colors.textSecondary }]}>
              Chế độ: {firebaseSyncInfo.syncMode}
            </Text>
            <Text style={[styles.fbMeta, { color: colors.textSecondary }]}>
              Cập nhật cuối:{' '}
              {firebaseSyncInfo.lastSyncedAt
                ? new Date(firebaseSyncInfo.lastSyncedAt).toLocaleTimeString()
                : 'Chưa đồng bộ'}
            </Text>
          </View>

          <CustomButton
            title="🔄 Đồng bộ ngay"
            onPress={handleManualSync}
            loading={firebaseSyncInfo.isSyncing}
            variant="secondary"
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
                'Đang bật công tắc Mô phỏng lỗi Firebase. Các thao tác đọc/ghi đám mây sẽ báo lỗi nhưng dữ liệu cục bộ vẫn an toàn.'}
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
        >
          <Text
            style={[
              styles.tabBtnText,
              {
                color: activeTab === 'wishlist' ? '#FFFFFF' : colors.text,
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
        >
          <Text
            style={[
              styles.tabBtnText,
              {
                color: activeTab === 'orders' ? '#FFFFFF' : colors.text,
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
            message="Hãy bấm vào biểu tượng trái tim ❤️ trên sản phẩm để lưu vào Firebase Wishlist (Case 9)."
            actionLabel="Xem Danh mục Sản phẩm"
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
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={[
                    styles.wishlistThumb,
                    { backgroundColor: colors.background },
                  ]}
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
                  Đã lưu:{' '}
                  {item.savedAt
                    ? new Date(item.savedAt).toLocaleString()
                    : 'Vừa xong'}
                </Text>

                <View style={styles.wishlistActions}>
                  <TouchableOpacity
                    style={[
                      styles.smallActionBtn,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => addToCart(item, 1)}
                  >
                    <Text style={styles.smallActionText}>+ Thêm vào giỏ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.smallActionBtn,
                      { backgroundColor: colors.dangerLight },
                    ]}
                    onPress={() => toggleWishlistProduct(item)}
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
            message="Khi bạn bấm Đặt hàng ở màn hình Giỏ hàng, thông tin đơn hàng sẽ được đồng bộ về đây."
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
                <Text style={[styles.orderId, { color: colors.primary }]}>
                  🧾 Mã đơn: {order.id}
                </Text>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: colors.successLight },
                  ]}
                >
                  <Text
                    style={[styles.statusTagText, { color: colors.success }]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.orderMeta, { color: colors.textSecondary }]}>
                Thời gian: {new Date(order.createdAt).toLocaleString()}
              </Text>
              <Text style={[styles.orderMeta, { color: colors.textSecondary }]}>
                Nguồn lưu trữ: {order.syncSource}
              </Text>
              {order.customerNote ? (
                <Text style={[styles.orderNote, { color: colors.text }]}>
                  📍 Ghi chú: {order.customerNote}
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
                  Tổng cộng ({order.totalItems} sản phẩm):
                </Text>
                <Text
                  style={[styles.orderTotalValue, { color: colors.primary }]}
                >
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
    paddingBottom: 32,
  },
  firebaseCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  fbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  fbTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  fbMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  fbErrorBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  fbErrorTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  fbErrorText: {
    fontSize: 12,
    lineHeight: 18,
  },
  disableSimBtn: {
    marginTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  wishlistCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  wishlistThumb: {
    width: 84,
    height: 84,
    borderRadius: 10,
    marginRight: 12,
  },
  wishlistInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  wishlistTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  wishlistPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  wishlistSavedAt: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  wishlistActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  orderNote: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  orderDivider: {
    height: 1,
    marginVertical: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemTitle: {
    flex: 1,
    fontSize: 13,
    marginRight: 8,
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderTotalValue: {
    fontSize: 17,
    fontWeight: '800',
  },
});

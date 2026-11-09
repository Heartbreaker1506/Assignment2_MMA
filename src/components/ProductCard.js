// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/components/ProductCard.js - Thẻ hiển thị sản phẩm dạng lưới 2 cột hiện đại
// =========================================================================

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/storage';

// Thẻ hiển thị sản phẩm dạng lưới 2 cột dọc (Modern 2-Column Grid Card)
export const ProductCard = ({
  product,
  inCartQty = 0,
  isSaved = false,
  onPressDetail,
  onAddToCart,
  onToggleWishlist,
}) => {
  const { colors } = useTheme();

  if (!product) return null;

  const discount = Math.round(Number(product.discountPercentage) || 0);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPressDetail && onPressDetail(product)}
      activeOpacity={0.88}
    >
      {/* Khu vực hình ảnh với các huy hiệu nổi */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Huy hiệu phần trăm giảm giá */}
        {discount > 0 ? (
          <View
            style={[
              styles.discountTag,
              { backgroundColor: colors.danger },
            ]}
          >
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        ) : null}

        {/* Nút tim lưu vào danh sách Yêu thích */}
        <TouchableOpacity
          style={[
            styles.wishlistBtn,
            {
              backgroundColor: isSaved ? colors.dangerLight : 'rgba(255,255,255,0.92)',
              borderColor: isSaved ? colors.danger : colors.border,
            },
          ]}
          onPress={() => onToggleWishlist && onToggleWishlist(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Text style={styles.wishlistIcon}>{isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin chi tiết sản phẩm */}
      <View style={styles.infoContainer}>
        {/* Nhãn thương hiệu và đánh giá sao */}
        <View style={styles.metaRow}>
          <Text
            style={[styles.brandTag, { color: colors.secondary }]}
            numberOfLines={1}
          >
            {(product.brand || product.category || 'SMARTSTORE').toUpperCase()}
          </Text>
          <Text style={[styles.ratingBadge, { color: colors.accent }]}>
            ★ {Number(product.rating || 4.8).toFixed(1)}
          </Text>
        </View>

        {/* Tiêu đề sản phẩm giới hạn 2 dòng */}
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>

        {/* Giá tiền nổi bật */}
        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {formatPrice(product.price)}
          </Text>
        </View>

        <Text
          style={[styles.stockInfo, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {product.stock > 0
            ? `Còn lại ${product.stock} sp`
            : 'Tạm hết hàng'}
        </Text>

        {/* Nút thêm vào giỏ hàng hoặc báo đã thêm */}
        <TouchableOpacity
          style={[
            styles.addCartBtn,
            {
              backgroundColor:
                inCartQty > 0 ? colors.success : colors.primary,
              shadowColor: inCartQty > 0 ? colors.success : colors.primary,
            },
          ]}
          onPress={() => onAddToCart && onAddToCart(product)}
          activeOpacity={0.8}
        >
          <Text style={styles.addCartBtnText}>
            {inCartQty > 0 ? `✓ Trong giỏ (${inCartQty})` : '+ Thêm giỏ'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  discountTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  wishlistIcon: {
    fontSize: 14,
  },
  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  brandTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    flex: 1,
  },
  ratingBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  stockInfo: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 8,
  },
  addCartBtn: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

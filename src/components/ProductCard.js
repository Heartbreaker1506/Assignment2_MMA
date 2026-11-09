// Author: Nguyễn Minh Quân - Student ID: CE180048

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/storage';

// Product card component displayed in the catalog FlatList
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
      activeOpacity={0.85}
    >
      {/* Product thumbnail and wishlist toggle button */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.thumbnail }}
          style={[styles.thumbnail, { backgroundColor: colors.background }]}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={[
            styles.wishlistBadge,
            {
              backgroundColor: isSaved ? colors.dangerLight : colors.surface,
              borderColor: isSaved ? colors.danger : colors.border,
            },
          ]}
          onPress={() => onToggleWishlist && onToggleWishlist(product)}
        >
          <Text style={styles.heartIcon}>{isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Product details and quick add-to-cart action */}
      <View style={styles.infoContainer}>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {product.category}
            </Text>
          </View>
          <Text style={[styles.ratingText, { color: colors.accent }]}>
            ★ {Number(product.rating || 4.5).toFixed(1)}
          </Text>
        </View>

        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>

        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {product.description}
        </Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatPrice(product.price)}
            </Text>
            <Text style={[styles.stockText, { color: colors.textSecondary }]}>
              Kho: {product.stock} | {product.brand}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addCartBtn,
              {
                backgroundColor:
                  inCartQty > 0 ? colors.success : colors.primary,
              },
            ]}
            onPress={() => onAddToCart && onAddToCart(product)}
          >
            <Text style={styles.addCartBtnText}>
              {inCartQty > 0 ? `+ Giỏ (${inCartQty})` : '+ Thêm giỏ'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 112,
    marginRight: 12,
  },
  thumbnail: {
    width: 100,
    height: 112,
    borderRadius: 10,
  },
  wishlistBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  stockText: {
    fontSize: 11,
    marginTop: 1,
  },
  addCartBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

export const ProductCard = ({ product, onPress, onAddToCart, isFavorite, onToggleFavorite }) => {
  if (!product) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(product)}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite && onToggleFavorite(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? COLORS.danger : COLORS.textMuted}
          />
        </TouchableOpacity>

        {/* Discount Badge */}
        {product.discountPercentage > 5 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{Math.round(product.discountPercentage)}%</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.category}>{product.category.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>

        {/* Rating & Stock */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.ratingText}>{Number(product.rating).toFixed(1)}</Text>
          <Text style={styles.stockText}>
            {product.stock > 0 ? `(Kho: ${product.stock})` : '(Hết hàng)'}
          </Text>
        </View>

        {/* Price & Add to Cart button */}
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart && onAddToCart(product)}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.danger,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
    minHeight: 34,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  stockText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


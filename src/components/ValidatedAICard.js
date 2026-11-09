import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

export const ValidatedAICard = ({ product, reason, onSelect, onAddToCart }) => {
  if (!product) return null;

  return (
    <View style={styles.card}>
      {/* Verification Shield Header */}
      <View style={styles.verifiedHeader}>
        <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
        <Text style={styles.verifiedText}>Đã xác thực trong kho hàng • ID: {product.id}</Text>
      </View>

      <View style={styles.body}>
        <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />

        <View style={styles.details}>
          <Text style={styles.category}>{product.category?.toUpperCase()}</Text>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={COLORS.star} />
            <Text style={styles.ratingText}>{Number(product.rating).toFixed(1)}</Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          </View>

          {reason ? (
            <Text style={styles.reason} numberOfLines={2}>
              💡 {reason}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => onSelect && onSelect(product)}
          activeOpacity={0.8}
        >
          <Text style={styles.detailBtnText}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => onAddToCart && onAddToCart(product)}
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={16} color={COLORS.white} />
          <Text style={styles.cartBtnText}>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE', // Indigo border
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  body: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
    marginLeft: 'auto',
  },
  reason: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  cartBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});


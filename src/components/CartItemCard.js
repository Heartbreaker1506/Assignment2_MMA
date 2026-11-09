// Author: Nguyễn Minh Quân - Student ID: CE180048

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/storage';

// Modern Luxury Cart Item Card Component
export const CartItemCard = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onUpdateNote,
  onPressProduct,
}) => {
  const { colors } = useTheme();
  const { product, quantity, note } = item;

  const lineSubtotal = Number(product.price || 0) * Number(quantity || 0);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.mainRow}>
        {/* Product Thumbnail */}
        <TouchableOpacity
          onPress={() => onPressProduct && onPressProduct(product)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: product.thumbnail }}
            style={[styles.image, { backgroundColor: colors.background }]}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Product Details & Stepper */}
        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {product.title}
            </Text>
            {/* Delete button */}
            <TouchableOpacity
              style={[
                styles.deleteBtn,
                { backgroundColor: colors.dangerLight },
              ]}
              onPress={() => onRemove(product.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.deleteIcon, { color: colors.danger }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.unitPrice, { color: colors.textSecondary }]}>
            {formatPrice(product.price)} / sản phẩm
          </Text>

          {/* Stepper & Line Subtotal Row */}
          <View style={styles.actionRow}>
            {/* Quantity Stepper */}
            <View
              style={[
                styles.stepperContainer,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => onDecrement(product.id)}
              >
                <Text style={[styles.stepperText, { color: colors.text }]}>
                  {quantity === 1 ? '🗑️' : '−'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.stepperValue, { color: colors.text }]}>
                {quantity}
              </Text>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => onIncrement(product.id)}
              >
                <Text style={[styles.stepperText, { color: colors.primary }]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>

            {/* Line Subtotal */}
            <View style={styles.subtotalWrap}>
              <Text style={[styles.subtotalLabel, { color: colors.textSecondary }]}>
                Thành tiền
              </Text>
              <Text style={[styles.subtotalAmount, { color: colors.primary }]}>
                {formatPrice(lineSubtotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Item Note Input */}
      <View
        style={[
          styles.noteWrapper,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.noteIcon}>✏️</Text>
        <TextInput
          style={[styles.noteInput, { color: colors.text }]}
          placeholder="Thêm ghi chú cho mặt hàng này (màu sắc, size...)"
          placeholderTextColor={colors.textSecondary}
          value={note || ''}
          onChangeText={(text) => onUpdateNote(product.id, text)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 74,
    height: 74,
    borderRadius: 12,
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 11,
    fontWeight: '800',
  },
  unitPrice: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  subtotalWrap: {
    alignItems: 'flex-end',
  },
  subtotalLabel: {
    fontSize: 10,
  },
  subtotalAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  noteWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    height: 36,
  },
  noteIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  noteInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 4,
  },
});

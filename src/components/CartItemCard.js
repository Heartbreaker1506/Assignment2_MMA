// Author: Trần Minh Quân - Student ID: CE181730

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/storage';

// Cart item card component with quantity increment/decrement, remove button, and custom note input
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
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => onPressProduct && onPressProduct(product)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: product.thumbnail }}
            style={[styles.image, { backgroundColor: colors.background }]}
          />
        </TouchableOpacity>

        <View style={styles.detailsCol}>
          <View style={styles.headerRow}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
            >
              {product.title}
            </Text>
            <TouchableOpacity
              style={[
                styles.removeBtn,
                { backgroundColor: colors.dangerLight },
              ]}
              onPress={() => onRemove(product.id)}
            >
              <Text style={[styles.removeBtnText, { color: colors.danger }]}>
                Xóa
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.unitPrice, { color: colors.textSecondary }]}>
            Đơn giá: {formatPrice(product.price)} / sp
          </Text>

          <View style={styles.quantityAndSubtotalRow}>
            {/* Quantity step controls */}
            <View
              style={[
                styles.qtyControls,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onDecrement(product.id)}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>
                  {quantity === 1 ? '🗑️' : '−'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.qtyValue, { color: colors.text }]}>
                {quantity}
              </Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onIncrement(product.id)}
              >
                <Text style={[styles.qtyBtnText, { color: colors.primary }]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.subtotalCol}>
              <Text
                style={[styles.subtotalLabel, { color: colors.textSecondary }]}
              >
                Thành tiền
              </Text>
              <Text style={[styles.subtotalValue, { color: colors.primary }]}>
                {formatPrice(lineSubtotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Optional note input for this specific cart item */}
      <TextInput
        style={[
          styles.noteInput,
          {
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        placeholder="Ghi chú cho mặt hàng này (VD: Màu đen, giao giờ hành chính...)"
        placeholderTextColor={colors.textSecondary}
        value={note || ''}
        onChangeText={(text) => onUpdateNote(product.id, text)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
  },
  image: {
    width: 82,
    height: 82,
    borderRadius: 10,
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  unitPrice: {
    fontSize: 12,
    marginTop: 3,
    marginBottom: 8,
  },
  quantityAndSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  qtyBtn: {
    width: 34,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  subtotalCol: {
    alignItems: 'flex-end',
  },
  subtotalLabel: {
    fontSize: 11,
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  noteInput: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

export const CartItemCard = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onUpdateNote,
}) => {
  const { product, quantity, note = '' } = item;
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState(note);

  const handleSaveNote = () => {
    setIsEditingNote(false);
    if (onUpdateNote) {
      onUpdateNote(product.id, currentNote);
    }
  };

  const itemTotal = (Number(product.price) || 0) * (Number(quantity) || 1);

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        {/* Product Image */}
        <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.unitPrice}>{formatCurrency(product.price)} / cái</Text>

          {/* Stepper & Total */}
          <View style={styles.controlsRow}>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => onDecrement(product.id)}
                style={styles.stepBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="remove" size={16} color={COLORS.text} />
              </TouchableOpacity>

              <Text style={styles.qtyText}>{quantity}</Text>

              <TouchableOpacity
                onPress={() => onIncrement(product.id)}
                style={styles.stepBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="add" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTotalText}>{formatCurrency(itemTotal)}</Text>
          </View>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          onPress={() => onRemove(product.id)}
          style={styles.removeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* Item Note Section (Transfer task readiness) */}
      <View style={styles.noteContainer}>
        {isEditingNote ? (
          <View style={styles.noteEditBox}>
            <TextInput
              style={styles.noteInput}
              value={currentNote}
              onChangeText={setCurrentNote}
              placeholder="Ghi chú (màu sắc, size, lời dặn...)"
              placeholderTextColor={COLORS.textLight}
            />
            <TouchableOpacity onPress={handleSaveNote} style={styles.saveNoteBtn}>
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.noteDisplay}
            onPress={() => setIsEditingNote(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={14} color={COLORS.primary} />
            <Text style={styles.noteText} numberOfLines={1}>
              {currentNote ? `Ghi chú: ${currentNote}` : 'Thêm ghi chú cho sản phẩm...'}
            </Text>
            <Ionicons name="pencil-outline" size={12} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  unitPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemTotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
  },
  removeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  noteContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  noteDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  noteEditBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: COLORS.text,
  },
  saveNoteBtn: {
    marginLeft: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 6,
  },
});

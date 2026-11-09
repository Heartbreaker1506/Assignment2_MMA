// Author: Trần Minh Quân - Student ID: CE181730

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../utils/storage';
import { CustomButton } from '../components/CustomButton';
import { StateFeedback } from '../components/StateFeedback';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { addToCart, getProductQuantityInCart } = useCart();
  const { isProductInWishlist, toggleWishlistProduct } = useShop();

  const product = route?.params?.product;
  const [selectedQty, setSelectedQty] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  if (!product) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StateFeedback
          type="error"
          title="Không tìm thấy thông tin sản phẩm"
          message="Dữ liệu sản phẩm truyền qua route params không hợp lệ."
          actionLabel="Quay lại Danh sách"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const inCartQty = getProductQuantityInCart(product.id);
  const isSaved = isProductInWishlist(product.id);

  const handleDecrease = () => {
    setSelectedQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    const maxStock = Math.max(1, Number(product.stock) || 20);
    setSelectedQty((prev) => Math.min(maxStock, prev + 1));
  };

  // Add selected quantity and note to shopping cart
  const handleAddProductToCart = async () => {
    await addToCart(product, selectedQty, customNote);
    setFeedbackMsg({
      type: 'success',
      text: `Đã thêm ${selectedQty} x "${product.title}" vào giỏ hàng thành công!`,
    });
    setCustomNote('');
  };

  // Toggle product in Firebase-synced wishlist
  const handleToggleWishlist = async () => {
    const res = await toggleWishlistProduct(product);
    if (!res.success && res.error) {
      setFeedbackMsg({
        type: 'error',
        text: res.error,
      });
    } else {
      setFeedbackMsg({
        type: 'success',
        text: res.added
          ? 'Đã đồng bộ sản phẩm vào danh sách Yêu thích (Firebase Wishlist)!'
          : 'Đã xóa sản phẩm khỏi danh sách Yêu thích.',
      });
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Main product image and discount badge */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.mainImage}
          resizeMode="contain"
        />
        {product.discountPercentage > 0 ? (
          <View
            style={[styles.discountBadge, { backgroundColor: colors.danger }]}
          >
            <Text style={styles.discountBadgeText}>
              -{Number(product.discountPercentage).toFixed(0)}%
            </Text>
          </View>
        ) : null}
      </View>

      {/* Product information card */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.tagRow}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {product.category}
            </Text>
          </View>

          <Text style={[styles.brandText, { color: colors.textSecondary }]}>
            Thương hiệu: {product.brand}
          </Text>

          <Text style={[styles.ratingText, { color: colors.accent }]}>
            ★ {Number(product.rating || 4.5).toFixed(1)} / 5.0
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(product.price)}
          </Text>
          <Text style={[styles.stockBadge, { color: colors.success }]}>
            • Còn {product.stock} sản phẩm trong kho
          </Text>
        </View>

        {inCartQty > 0 ? (
          <View
            style={[
              styles.inCartBanner,
              {
                backgroundColor: colors.successLight,
                borderColor: colors.success,
              },
            ]}
          >
            <Text style={[styles.inCartBannerText, { color: colors.success }]}>
              🛒 Hiện đang có {inCartQty} sản phẩm này trong Giỏ hàng của bạn.
            </Text>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Mô tả chi tiết sản phẩm
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {product.description}
        </Text>
      </View>

      {/* Quantity selector, note input, and purchase actions */}
      <View
        style={[
          styles.actionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tùy chọn mua hàng
        </Text>

        <View style={styles.qtySelectorRow}>
          <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>
            Số lượng cần mua:
          </Text>
          <View
            style={[
              styles.qtyBox,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.qtyStepBtn}
              onPress={handleDecrease}
            >
              <Text style={[styles.qtyStepText, { color: colors.text }]}>
                −
              </Text>
            </TouchableOpacity>

            <Text style={[styles.qtyNumber, { color: colors.text }]}>
              {selectedQty}
            </Text>

            <TouchableOpacity
              style={styles.qtyStepBtn}
              onPress={handleIncrease}
            >
              <Text style={[styles.qtyStepText, { color: colors.primary }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.subtotalPreview, { color: colors.textSecondary }]}>
          Tạm tính mục này:{' '}
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            {formatPrice(product.price * selectedQty)}
          </Text>
        </Text>

        <TextInput
          style={[
            styles.noteInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Ghi chú khi thêm vào giỏ (VD: Gói quà, chọn màu...)"
          placeholderTextColor={colors.textSecondary}
          value={customNote}
          onChangeText={setCustomNote}
        />

        {feedbackMsg ? (
          <View
            style={[
              styles.feedbackBox,
              {
                backgroundColor:
                  feedbackMsg.type === 'error'
                    ? colors.dangerLight
                    : colors.successLight,
                borderColor:
                  feedbackMsg.type === 'error' ? colors.danger : colors.success,
              },
            ]}
          >
            <Text
              style={{
                color:
                  feedbackMsg.type === 'error' ? colors.danger : colors.success,
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              {feedbackMsg.text}
            </Text>
          </View>
        ) : null}

        <CustomButton
          title={`🛒 Thêm ${selectedQty} vào Giỏ hàng (${formatPrice(
            product.price * selectedQty
          )})`}
          onPress={handleAddProductToCart}
          variant="primary"
          style={styles.mainBtn}
        />

        <View style={styles.secondaryBtnsRow}>
          <CustomButton
            title={isSaved ? '❤️ Đã lưu Wishlist' : '🤍 Lưu vào Wishlist'}
            onPress={handleToggleWishlist}
            variant={isSaved ? 'danger' : 'outline'}
            style={styles.halfBtn}
          />
          <CustomButton
            title="Đi tới Giỏ hàng →"
            onPress={() => navigation.navigate('Cart')}
            variant="secondary"
            style={styles.halfBtn}
          />
        </View>

        {/* Shortcut to ask Gemini AI about this product */}
        <CustomButton
          title="🤖 Nhờ Gemini AI đánh giá / So sánh sản phẩm này"
          onPress={() =>
            navigation.navigate('AiAssistant', {
              initialPrompt: `Đánh giá sản phẩm "${product.title}" giá $${product.price} và so sánh với các sản phẩm cùng tầm giá trong Catalog.`,
              initialBudget: Math.ceil(product.price * 1.2),
            })
          }
          variant="outline"
          style={{ marginTop: 10, borderColor: colors.purple }}
          textStyle={{ color: colors.purple }}
        />
      </View>
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
  imageContainer: {
    position: 'relative',
    height: 230,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 14,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
  },
  stockBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
  inCartBanner: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  inCartBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  qtySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  qtyStepBtn: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyStepText: {
    fontSize: 18,
    fontWeight: '700',
  },
  qtyNumber: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
  subtotalPreview: {
    fontSize: 13,
    marginBottom: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  feedbackBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  mainBtn: {
    marginBottom: 10,
  },
  secondaryBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
});

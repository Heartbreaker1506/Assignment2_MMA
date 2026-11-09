// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/screens/catalog/ProductInfoScreen.js - Màn hình 2: Chi tiết sản phẩm & Thêm vào giỏ (R04, R05)
// =========================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../utils/storage';
import { CustomButton } from '../components/CustomButton';
import { StateFeedback } from '../components/StateFeedback';

export const ProductInfoScreen = ({ route, navigation }) => {
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
  const discount = Math.round(Number(product.discountPercentage) || 0);

  const handleDecrease = () => {
    setSelectedQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    const maxStock = Math.max(1, Number(product.stock) || 20);
    setSelectedQty((prev) => Math.min(maxStock, prev + 1));
  };

  // Thêm số lượng sản phẩm đã chọn kèm ghi chú vào giỏ hàng
  const handleAddProductToCart = async () => {
    await addToCart(product, selectedQty, customNote);
    setFeedbackMsg({
      type: 'success',
      text: `✓ Đã thêm ${selectedQty} x "${product.title}" vào giỏ hàng!`,
    });
    setCustomNote('');
  };

  // Thêm hoặc xóa sản phẩm khỏi danh sách Yêu thích Firebase
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
          ? '❤️ Đã lưu vào danh sách Yêu thích (Firebase Wishlist)!'
          : '🤍 Đã xóa khỏi danh sách Yêu thích.',
      });
    }
  };

  // Mở Trợ lý Gemini AI với câu hỏi được chuẩn bị sẵn về sản phẩm này
  const handleAskGeminiAboutThis = () => {
    navigation.navigate('AiAssistant', {
      initialPrompt: `Tư vấn chi tiết về ${product.title} (${product.brand}), phân tích ưu nhược điểm và xem có phù hợp với tầm giá ${formatPrice(product.price)} không?`,
      initialBudget: product.price,
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Thông báo phản hồi thao tác thành công hoặc có lỗi */}
      {feedbackMsg ? (
        <View
          style={[
            styles.feedbackBanner,
            {
              backgroundColor:
                feedbackMsg.type === 'error'
                  ? colors.dangerLight
                  : colors.successLight,
              borderColor:
                feedbackMsg.type === 'error'
                  ? colors.danger
                  : colors.success,
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              {
                color:
                  feedbackMsg.type === 'error'
                    ? colors.danger
                    : colors.success,
              },
            ]}
          >
            {feedbackMsg.text}
          </Text>
        </View>
      ) : null}

      {/* Khu vực ảnh đại diện lớn với huy hiệu giảm giá và nút Yêu thích */}
      <View
        style={[
          styles.mediaShowcase,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.heroImage}
          resizeMode="contain"
        />

        {/* Huy hiệu giảm giá nổi */}
        {discount > 0 ? (
          <View style={[styles.discountTag, { backgroundColor: colors.danger }]}>
            <Text style={styles.discountTagText}>GIẢM {discount}%</Text>
          </View>
        ) : null}

        {/* Nút tim lưu vào danh sách Yêu thích */}
        <TouchableOpacity
          style={[
            styles.wishlistFloatBtn,
            {
              backgroundColor: isSaved ? colors.dangerLight : 'rgba(255,255,255,0.92)',
              borderColor: isSaved ? colors.danger : colors.border,
            },
          ]}
          onPress={handleToggleWishlist}
          activeOpacity={0.8}
        >
          <Text style={styles.wishlistFloatIcon}>{isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Thẻ chi tiết sản phẩm chính */}
      <View
        style={[
          styles.detailCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Hàng nhãn phân loại, thương hiệu và điểm số */}
        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryPill,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.categoryPillText, { color: colors.primary }]}>
              {product.category}
            </Text>
          </View>

          <View
            style={[
              styles.brandPill,
              { backgroundColor: colors.secondaryLight },
            ]}
          >
            <Text style={[styles.brandPillText, { color: colors.secondary }]}>
              {product.brand}
            </Text>
          </View>

          <View style={styles.ratingBadge}>
            <Text style={[styles.ratingText, { color: colors.accent }]}>
              ★ {Number(product.rating || 4.8).toFixed(1)} / 5.0
            </Text>
          </View>
        </View>

        {/* Tiêu đề sản phẩm */}
        <Text style={[styles.title, { color: colors.text }]}>
          {product.title}
        </Text>

        {/* Giá tiền và huy hiệu tình trạng còn hàng */}
        <View style={styles.priceStockRow}>
          <Text style={[styles.priceAmount, { color: colors.primary }]}>
            {formatPrice(product.price)}
          </Text>
          <View
            style={[
              styles.stockBadge,
              {
                backgroundColor:
                  product.stock > 0 ? colors.successLight : colors.dangerLight,
              },
            ]}
          >
            <Text
              style={[
                styles.stockBadgeText,
                { color: product.stock > 0 ? colors.success : colors.danger },
              ]}
            >
              {product.stock > 0
                ? `● Còn hàng (${product.stock} sp)`
                : '▲ Tạm hết hàng'}
            </Text>
          </View>
        </View>

        {/* Mô tả chi tiết */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Mô tả sản phẩm
        </Text>
        <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
          {product.description}
        </Text>

        {/* Thẻ lối tắt kết nối Trợ lý Gemini AI */}
        <TouchableOpacity
          style={[
            styles.aiCard,
            {
              backgroundColor: colors.purpleLight,
              borderColor: colors.purple,
            },
          ]}
          onPress={handleAskGeminiAboutThis}
          activeOpacity={0.8}
        >
          <View style={styles.aiCardHeader}>
            <Text style={[styles.aiCardTitle, { color: colors.purple }]}>
              🤖 Hỏi Trợ lý Gemini AI về sản phẩm này
            </Text>
            <Text style={{ fontSize: 14 }}>→</Text>
          </View>
          <Text style={[styles.aiCardBody, { color: colors.text }]}>
            Nhận phân tích ưu nhược điểm, so sánh trong tầm giá và xem sản phẩm
            này có phù hợp với nhu cầu của bạn không.
          </Text>
        </TouchableOpacity>

        {/* Bộ đếm chọn số lượng cần mua */}
        <View style={styles.stepperSection}>
          <Text style={[styles.stepperLabel, { color: colors.text }]}>
            Số lượng mua:
          </Text>
          <View
            style={[
              styles.stepperControls,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={handleDecrease}
              disabled={selectedQty <= 1}
            >
              <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                −
              </Text>
            </TouchableOpacity>

            <Text style={[styles.stepperValueText, { color: colors.text }]}>
              {selectedQty}
            </Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={handleIncrease}
              disabled={selectedQty >= (Number(product.stock) || 20)}
            >
              <Text style={[styles.stepperBtnText, { color: colors.primary }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ô nhập ghi chú riêng cho đơn hàng */}
        <TextInput
          style={[
            styles.noteInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Thêm yêu cầu hoặc ghi chú (màu sắc, cấu hình...)"
          placeholderTextColor={colors.textSecondary}
          value={customNote}
          onChangeText={setCustomNote}
        />

        {/* Hàng 2 nút hành động: Thêm giỏ hàng & Lưu Wishlist */}
        <View style={styles.actionButtonsRow}>
          <CustomButton
            title={
              inCartQty > 0
                ? `+ Thêm tiếp (Hiện có ${inCartQty} trong giỏ)`
                : `+ Thêm vào Giỏ hàng • ${formatPrice(product.price * selectedQty)}`
            }
            onPress={handleAddProductToCart}
            variant="primary"
            style={{ flex: 1 }}
          />

          <TouchableOpacity
            style={[
              styles.wishlistToggleBtn,
              {
                backgroundColor: isSaved ? colors.dangerLight : colors.background,
                borderColor: isSaved ? colors.danger : colors.border,
              },
            ]}
            onPress={handleToggleWishlist}
            activeOpacity={0.8}
          >
            <Text style={styles.wishlistToggleIcon}>
              {isSaved ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lối tắt xem nhanh giỏ hàng nếu đã có sản phẩm bên trong */}
        {inCartQty > 0 ? (
          <TouchableOpacity
            style={styles.viewCartShortcut}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={[styles.viewCartText, { color: colors.primary }]}>
              → Xem giỏ hàng & Tiến hành thanh toán
            </Text>
          </TouchableOpacity>
        ) : null}
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
    paddingBottom: 36,
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mediaShowcase: {
    position: 'relative',
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  discountTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  discountTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  wishlistFloatBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  wishlistFloatIcon: {
    fontSize: 16,
  },
  detailCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  brandPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratingBadge: {
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 10,
  },
  priceStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  aiCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  aiCardBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  stepperSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepperValueText: {
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 6 : 10,
    minHeight: 44,
    fontSize: 13,
    textAlignVertical: 'center',
    marginBottom: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wishlistToggleBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistToggleIcon: {
    fontSize: 20,
  },
  viewCartShortcut: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewCartText: {
    fontSize: 13,
    fontWeight: '700',
  },
});


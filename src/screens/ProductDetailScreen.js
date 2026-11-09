import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productApi } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { Header } from '../components/Header';
import { COLORS, SHADOWS } from '../constants/colors';
import { formatCurrency, calculateDiscountPrice } from '../utils/formatters';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }) => {
  const { productId, product: initialProduct } = route.params || {};

  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addToCart, itemCount } = useCart();
  const { isFavorite, toggleWishlist } = useWishlist();

  // Load product detail if not passed or missing fields
  useEffect(() => {
    if (!product && productId) {
      setLoading(true);
      setError(null);
      productApi.fetchProductById(productId)
        .then((data) => {
          setProduct(data);
        })
        .catch((err) => {
          setError(err.message || 'Không thể tải thông tin sản phẩm');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [productId, product]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết sản phẩm" showBack onBack={() => navigation.goBack()} />
        <LoadingView message="Đang tải thông tin sản phẩm..." />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <Header title="Lỗi sản phẩm" showBack onBack={() => navigation.goBack()} />
        <ErrorView
          title="Không tìm thấy sản phẩm"
          message={error || 'Sản phẩm với mã ID này không tồn tại trong hệ thống.'}
          onRetry={() => {
            if (productId) {
              setLoading(true);
              setError(null);
              productApi.fetchProductById(productId)
                .then(setProduct)
                .catch((e) => setError(e.message))
                .finally(() => setLoading(false));
            }
          }}
        />
      </View>
    );
  }

  const isFavorited = isFavorite(product.id);
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.thumbnail];
  const activeImage = images[selectedImageIndex] || product.thumbnail;
  const discountedPrice = calculateDiscountPrice(product.price, product.discountPercentage);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      'Đã thêm vào giỏ hàng',
      `Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng thành công!`,
      [
        { text: 'Tiếp tục xem', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('CartTab') },
      ]
    );
  };

  const handleAskAIAboutProduct = () => {
    navigation.navigate('AI Advisor', {
      initialPrompt: `Hãy phân tích ưu nhược điểm, độ bền và tính năng nổi bật của sản phẩm "${product.title}" (${formatCurrency(product.price)}). Có đáng tiền không?`,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title={product.title}
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="cart-outline"
        rightBadgeCount={itemCount}
        onRightPress={() => navigation.navigate('CartTab')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Image Display */}
        <View style={styles.heroImageContainer}>
          <Image source={{ uri: activeImage }} style={styles.heroImage} resizeMode="contain" />

          {/* Floating Favorite Button */}
          <TouchableOpacity
            style={styles.floatingHeart}
            onPress={() => toggleWishlist(product)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorited ? COLORS.danger : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
            {images.map((imgUrl, idx) => (
              <TouchableOpacity
                key={`${imgUrl}-${idx}`}
                onPress={() => setSelectedImageIndex(idx)}
                style={[styles.thumbBox, selectedImageIndex === idx && styles.thumbBoxActive]}
              >
                <Image source={{ uri: imgUrl }} style={styles.thumbImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Section */}
        <View style={styles.infoCard}>
          <View style={styles.categoryBadgeRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{(product.category || '').toUpperCase()}</Text>
            </View>
            <Text style={styles.brandText}>Hãng: {product.brand || 'Chính hãng'}</Text>
          </View>

          <Text style={styles.title}>{product.title}</Text>

          {/* Rating and Stock */}
          <View style={styles.ratingRow}>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.ratingValue}>{Number(product.rating).toFixed(1)}</Text>
            </View>
            <Text style={styles.stockStatus}>
              {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
            </Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceRow}>
            <Text style={styles.finalPrice}>{formatCurrency(discountedPrice)}</Text>
            {product.discountPercentage > 0 && (
              <>
                <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>-{Math.round(product.discountPercentage)}%</Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionHeader}>Mô tả chi tiết</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Ask Gemini Entry Point (Mandatory integration R10) */}
          <TouchableOpacity
            style={styles.aiAdvisorBox}
            onPress={handleAskAIAboutProduct}
            activeOpacity={0.85}
          >
            <View style={styles.aiIconBubble}>
              <Ionicons name="sparkles" size={20} color={COLORS.accent} />
            </View>
            <View style={styles.aiAdvisorTextCol}>
              <Text style={styles.aiAdvisorTitle}>Tư vấn bằng Gemini AI</Text>
              <Text style={styles.aiAdvisorSubtitle}>
                Hỏi AI để so sánh sản phẩm này và nhận tư vấn mua sắm thông minh
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity Stepper */}
        <View style={styles.quantityPicker}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Ionicons name="remove" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.qtyDisplay}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
          >
            <Ionicons name="add" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[styles.addToCartBtn, product.stock <= 0 && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={20} color={COLORS.white} />
          <Text style={styles.addToCartText}>
            {product.stock > 0 ? `Thêm vào giỏ • ${formatCurrency(discountedPrice * quantity)}` : 'Hết hàng'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroImageContainer: {
    width: width,
    height: 300,
    backgroundColor: COLORS.card,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroImage: {
    width: '90%',
    height: '90%',
  },
  floatingHeart: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  thumbnailRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: COLORS.card,
  },
  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumbBoxActive: {
    borderColor: COLORS.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: COLORS.card,
    marginTop: 10,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryChipText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  brandText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  stockStatus: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  finalPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.danger,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountTagText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  descSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  aiAdvisorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  aiAdvisorTextCol: {
    flex: 1,
  },
  aiAdvisorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  aiAdvisorSubtitle: {
    fontSize: 11,
    color: '#6D28D9',
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisplay: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 10,
    color: COLORS.text,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 48,
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: COLORS.textLight,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});


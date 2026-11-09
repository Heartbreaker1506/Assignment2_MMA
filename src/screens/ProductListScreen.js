import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { COLORS } from '../constants/colors';

export const ProductListScreen = ({ navigation }) => {
  const {
    products,
    categories,
    selectedCategory,
    loading,
    isFetchingMore,
    refreshing,
    error,
    hasMore,
    refreshProducts,
    loadMoreProducts,
    handleSearch,
    handleCategorySelect,
    retry,
  } = useProducts();

  const { addToCart, itemCount } = useCart();
  const { isFavorite, toggleWishlist } = useWishlist();

  const [inputSearch, setInputSearch] = useState('');
  const [sortBy, setSortBy] = useState('none'); // 'none' | 'price-asc' | 'price-desc' | 'rating'

  // Submit search query
  const onSubmitSearch = () => {
    handleSearch(inputSearch);
  };

  const onClearSearch = () => {
    setInputSearch('');
    handleSearch('');
  };

  // Sorting logic (Pre-wired for Transfer Task in PDF Section 8.1)
  const displayedProducts = useMemo(() => {
    if (!products) return [];
    let list = [...products];
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [products, sortBy]);

  // Cycle through sort options
  const toggleSort = () => {
    if (sortBy === 'none') setSortBy('price-asc');
    else if (sortBy === 'price-asc') setSortBy('price-desc');
    else if (sortBy === 'price-desc') setSortBy('rating');
    else setSortBy('none');
  };

  const getSortLabel = () => {
    if (sortBy === 'price-asc') return 'Giá: Thấp -> Cao';
    if (sortBy === 'price-desc') return 'Giá: Cao -> Thấp';
    if (sortBy === 'rating') return 'Đánh giá cao';
    return 'Mặc định';
  };

  // Render Footer for Pagination
  const renderFooter = () => {
    if (isFetchingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerLoadingText}>Đang tải thêm sản phẩm...</Text>
        </View>
      );
    }
    if (!hasMore && products.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerEndText}>Đã hiển thị tất cả sản phẩm ({products.length})</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>SmartShop</Text>
          <Text style={styles.brandSubtitle}>Hàng chính hãng • Giao nhanh 2h</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Ask AI button shortcut */}
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate('AI Advisor')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={16} color={COLORS.accent} />
            <Text style={styles.aiButtonText}>Hỏi AI</Text>
          </TouchableOpacity>

          {/* Cart Icon with badge */}
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('CartTab')}
          >
            <Ionicons name="cart-outline" size={24} color={COLORS.text} />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên sản phẩm, thương hiệu..."
            value={inputSearch}
            onChangeText={setInputSearch}
            onSubmitEditing={onSubmitSearch}
            returnKeyType="search"
            placeholderTextColor={COLORS.textLight}
          />
          {inputSearch.length > 0 && (
            <TouchableOpacity onPress={onClearSearch}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Button (Transfer task pre-wired) */}
        <TouchableOpacity style={styles.sortButton} onPress={toggleSort} activeOpacity={0.8}>
          <Ionicons name="funnel-outline" size={18} color={sortBy !== 'none' ? COLORS.primary : COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Sort Status Chip if active */}
      {sortBy !== 'none' && (
        <View style={styles.activeSortRow}>
          <Text style={styles.activeSortText}>Sắp xếp: <Text style={{ fontWeight: '700' }}>{getSortLabel()}</Text></Text>
          <TouchableOpacity onPress={() => setSortBy('none')}>
            <Ionicons name="close" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Category Filter Chips */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => handleCategorySelect(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                  {cat === 'all' ? 'Tất cả' : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Body States: Loading, Error, Empty, or FlatList */}
      {loading && products.length === 0 ? (
        <LoadingView message="Đang tải danh mục sản phẩm..." />
      ) : error && products.length === 0 ? (
        <ErrorView message={error} onRetry={retry} />
      ) : (
        <FlatList
          data={displayedProducts}
          numColumns={2}
          keyExtractor={(item) => `prod-${item.id}`}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(prod) => navigation.navigate('ProductDetail', { productId: prod.id, product: prod })}
              onAddToCart={(prod) => addToCart(prod, 1)}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={toggleWishlist}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshProducts}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyView
              icon="search-outline"
              title="Không tìm thấy sản phẩm"
              message="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc danh mục."
              actionLabel="Xem tất cả sản phẩm"
              onAction={() => {
                onClearSearch();
                handleCategorySelect('all');
              }}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.card,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  brandSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  aiButtonText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  cartBtn: {
    padding: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  sortButton: {
    width: 42,
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  activeSortText: {
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  categoryContainer: {
    backgroundColor: COLORS.card,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
  categoryTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    padding: 10,
    paddingBottom: 24,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerLoadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  footerEnd: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerEndText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});


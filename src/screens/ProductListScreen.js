// Author: Trần Minh Quân - Student ID: CE181730

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {
  PRODUCT_CATEGORIES,
  SHOP_CONFIG,
  STUDENT_INFO,
} from '../constants/theme';
import {
  fetchProductsPage,
  getFallbackProductsPage,
} from '../services/productService';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { StateFeedback } from '../components/StateFeedback';

export const ProductListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { cartSummary, addToCart, getProductQuantityInCart } = useCart();
  const {
    wishlist,
    orders,
    isProductInWishlist,
    toggleWishlistProduct,
    registerCatalogProducts,
    simulationFlags,
    toggleSimulationFlag,
  } = useShop();

  // Search query and category filter state
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Product list and pagination state
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [dataSource, setDataSource] = useState('remote_api');

  // Async loading and error state
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Synchronous ref guard to prevent duplicate pagination requests during fast scroll
  const isFetchingMoreRef = useRef(false);

  // Load the first page of products (on mount, filter change, or pull-to-refresh)
  const loadFirstPage = useCallback(
    async ({ isPullRefresh = false, useFallbackMode = false } = {}) => {
      if (isPullRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingInitial(true);
      }
      setErrorMessage(null);
      isFetchingMoreRef.current = false;

      try {
        let result;
        if (useFallbackMode) {
          result = getFallbackProductsPage({
            limit: SHOP_CONFIG.PAGE_LIMIT,
            skip: 0,
            searchQuery: searchText,
            category: selectedCategory,
          });
        } else {
          result = await fetchProductsPage({
            limit: SHOP_CONFIG.PAGE_LIMIT,
            skip: 0,
            searchQuery: searchText,
            category: selectedCategory,
            simulateError: simulationFlags.simulateApiError,
          });
        }

        setProducts(result.products);
        setSkip(result.products.length);
        setTotalCount(result.total);
        setHasMore(result.hasMore);
        setDataSource(result.source);

        // Share loaded products with ShopContext for Gemini AI context
        registerCatalogProducts(result.products);
      } catch (error) {
        setErrorMessage(
          error.message || 'Không thể tải danh sách sản phẩm từ máy chủ.'
        );
      } finally {
        setIsLoadingInitial(false);
        setIsRefreshing(false);
      }
    },
    [
      searchText,
      selectedCategory,
      simulationFlags.simulateApiError,
      registerCatalogProducts,
    ]
  );

  // Reload first page when search query, category, or simulation flag changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFirstPage({ isPullRefresh: false, useFallbackMode: false });
    }, 250);
    return () => clearTimeout(timer);
  }, [loadFirstPage]);

  // Load next page when scrolling to the end of FlatList
  const handleLoadMore = async () => {
    if (
      isFetchingMoreRef.current ||
      isLoadingInitial ||
      isRefreshing ||
      isLoadingMore ||
      !hasMore ||
      Boolean(errorMessage)
    ) {
      return;
    }

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      let nextResult;
      if (dataSource === 'offline_fallback') {
        nextResult = getFallbackProductsPage({
          limit: SHOP_CONFIG.PAGE_LIMIT,
          skip,
          searchQuery: searchText,
          category: selectedCategory,
        });
      } else {
        nextResult = await fetchProductsPage({
          limit: SHOP_CONFIG.PAGE_LIMIT,
          skip,
          searchQuery: searchText,
          category: selectedCategory,
          simulateError: simulationFlags.simulateApiError,
        });
      }

      // Append new items and deduplicate by product ID
      setProducts((prevProducts) => {
        const existingIds = new Set(prevProducts.map((item) => Number(item.id)));
        const uniqueNewItems = nextResult.products.filter(
          (item) => !existingIds.has(Number(item.id))
        );
        return [...prevProducts, ...uniqueNewItems];
      });

      setSkip((prevSkip) => prevSkip + nextResult.products.length);
      setTotalCount(nextResult.total);
      setHasMore(nextResult.hasMore);
      registerCatalogProducts(nextResult.products);
    } catch (error) {
      setErrorMessage(
        `Lỗi tải thêm trang mới: ${error.message || 'Mất kết nối mạng'}`
      );
    } finally {
      setIsLoadingMore(false);
      isFetchingMoreRef.current = false;
    }
  };

  // Pull-to-refresh handler: reset pagination to page 1
  const handlePullToRefresh = () => {
    loadFirstPage({ isPullRefresh: true, useFallbackMode: false });
  };

  // Clear search query and category filter
  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCategory('all');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Student summary and quick navigation shortcuts */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.appTitle, { color: colors.primary }]}>
              SmartShop E-Commerce
            </Text>
            <Text style={[styles.studentMeta, { color: colors.textSecondary }]}>
              SV: {STUDENT_INFO.name} • MSSV: {STUDENT_INFO.studentId}
            </Text>
          </View>
          <View
            style={[
              styles.sourceBadge,
              {
                backgroundColor:
                  dataSource === 'remote_api'
                    ? colors.successLight
                    : colors.warningLight,
              },
            ]}
          >
            <Text
              style={[
                styles.sourceBadgeText,
                {
                  color:
                    dataSource === 'remote_api'
                      ? colors.success
                      : colors.warning,
                },
              ]}
            >
              {dataSource === 'remote_api' ? '🌐 Remote API' : '📦 Offline Mode'}
            </Text>
          </View>
        </View>

        {/* Quick navigation chips to Cart, SavedOrders, AiAssistant, and Settings */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={[
              styles.navChip,
              { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={[styles.navChipText, { color: colors.primary }]}>
              🛒 Giỏ ({cartSummary.totalItems})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navChip,
              { backgroundColor: colors.dangerLight },
            ]}
            onPress={() => navigation.navigate('SavedOrders')}
          >
            <Text style={[styles.navChipText, { color: colors.danger }]}>
              ❤️ Lưu ({wishlist.length}) • Đơn ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navChip,
              { backgroundColor: colors.purpleLight },
            ]}
            onPress={() => navigation.navigate('AiAssistant')}
          >
            <Text style={[styles.navChipText, { color: colors.purple }]}>
              🤖 Gemini AI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navChip,
              {
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Text style={[styles.navChipText, { color: colors.text }]}>
              ⚙️ Cài đặt & Test
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Warning banner when API error simulation is active */}
      {simulationFlags.simulateApiError ? (
        <View
          style={[
            styles.simAlertBox,
            {
              backgroundColor: colors.warningLight,
              borderColor: colors.warning,
            },
          ]}
        >
          <Text style={[styles.simAlertText, { color: colors.warning }]}>
            🧪 Đang bật chế độ Mô phỏng Lỗi API (Test Case 2).
          </Text>
          <TouchableOpacity
            onPress={() => toggleSimulationFlag('simulateApiError')}
          >
            <Text style={[styles.simAlertLink, { color: colors.primary }]}>
              Tắt mô phỏng & Tải lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Keyword search bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm theo tên sản phẩm, hãng (VD: iPhone, Laptop...)"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText.length > 0 ? (
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={() => setSearchText('')}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>
              ✕
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Horizontal category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination statistics and filter reset link */}
      <View style={styles.statsRow}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          Hiển thị {products.length} / {totalCount} sản phẩm (Trang:{' '}
          {Math.ceil(products.length / SHOP_CONFIG.PAGE_LIMIT) || 1})
        </Text>
        {(searchText.length > 0 || selectedCategory !== 'all') && (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={[styles.resetFilterLink, { color: colors.primary }]}>
              Xóa bộ lọc
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (isLoadingInitial || products.length === 0) return null;

    if (isLoadingMore) {
      return (
        <View style={styles.footerBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Đang tải thêm sản phẩm (limit={SHOP_CONFIG.PAGE_LIMIT}, skip={skip}
            )...
          </Text>
        </View>
      );
    }

    if (!hasMore) {
      return (
        <View style={styles.footerBox}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ✓ Đã hiển thị toàn bộ {products.length} sản phẩm trong danh mục.
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.loadMoreBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primary,
          },
        ]}
        onPress={handleLoadMore}
      >
        <Text style={[styles.loadMoreBtnText, { color: colors.primary }]}>
          ↓ Tải thêm sản phẩm ({products.length}/{totalCount})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={errorMessage ? [] : products}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            inCartQty={getProductQuantityInCart(item.id)}
            isSaved={isProductInWishlist(item.id)}
            onPressDetail={(prod) =>
              navigation.navigate('ProductDetail', { product: prod })
            }
            onAddToCart={(prod) => addToCart(prod, 1)}
            onToggleWishlist={(prod) => toggleWishlistProduct(prod)}
          />
        )}
        ListEmptyComponent={
          isLoadingInitial ? (
            <StateFeedback
              type="loading"
              title="Đang tải danh mục sản phẩm từ API..."
              message="Đang đồng bộ dữ liệu Catalog về thiết bị"
            />
          ) : errorMessage ? (
            <StateFeedback
              type="error"
              title="Không thể tải danh mục sản phẩm (R01)"
              message={errorMessage}
              actionLabel="Thử lại (Retry API)"
              onAction={() =>
                loadFirstPage({ isPullRefresh: false, useFallbackMode: false })
              }
              secondaryActionLabel="Dùng dữ liệu Offline dự phòng"
              onSecondaryAction={() =>
                loadFirstPage({ isPullRefresh: false, useFallbackMode: true })
              }
            />
          ) : (
            <StateFeedback
              type="empty"
              title="Không tìm thấy sản phẩm phù hợp (R02)"
              message={`Không có sản phẩm nào khớp với từ khóa "${searchText}" trong danh mục đã chọn.`}
              actionLabel="Xóa bộ lọc tìm kiếm"
              onAction={handleResetFilters}
            />
          )
        }
        ListFooterComponent={renderFooter()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handlePullToRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
  },
  headerContainer: {
    marginBottom: 10,
  },
  heroCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  studentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickNavRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  navChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  navChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  simAlertBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  simAlertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  simAlertLink: {
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  clearSearchBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  categoriesScroll: {
    paddingBottom: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  statsText: {
    fontSize: 12,
  },
  resetFilterLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerBox: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
  },
  loadMoreBtn: {
    marginVertical: 10,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  loadMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

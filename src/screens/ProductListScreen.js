// Author: Nguyễn Minh Quân - Student ID: CE180048

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
  Platform,
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
  const { colors, isDarkMode } = useTheme();
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
      {/* Luxury Brand & Author Showcase Card */}
      <View
        style={[
          styles.brandCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.brandTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitle, { color: colors.primary }]}>
                {STUDENT_INFO.brandName}
              </Text>
              <View
                style={[
                  styles.authorPill,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text style={[styles.authorPillText, { color: colors.primary }]}>
                  {STUDENT_INFO.studentId}
                </Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              SV: {STUDENT_INFO.name} • {STUDENT_INFO.studentId}
            </Text>
          </View>

          {/* Data source live indicator */}
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
              {dataSource === 'remote_api' ? '● Online API' : '▲ Offline'}
            </Text>
          </View>
        </View>

        {/* 4 Quick Nav Shortcut Pills (2x2 Grid) */}
        <View style={styles.quickNavGrid}>
          <TouchableOpacity
            style={[
              styles.navCardBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.primaryLight,
              },
            ]}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.7}
          >
            <Text style={styles.navCardIcon}>🛍️</Text>
            <View style={styles.navCardTextCol}>
              <Text style={[styles.navCardTitle, { color: colors.text }]} numberOfLines={1}>
                Giỏ hàng
              </Text>
              <Text style={[styles.navCardBadge, { color: colors.primary }]} numberOfLines={1}>
                {cartSummary.totalItems} sản phẩm
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navCardBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.dangerLight,
              },
            ]}
            onPress={() => navigation.navigate('SavedOrders', { initialTab: 'wishlist' })}
            activeOpacity={0.7}
          >
            <Text style={styles.navCardIcon}>❤️</Text>
            <View style={styles.navCardTextCol}>
              <Text style={[styles.navCardTitle, { color: colors.text }]} numberOfLines={1}>
                Yêu thích
              </Text>
              <Text style={[styles.navCardBadge, { color: colors.danger }]} numberOfLines={1}>
                {wishlist.length} đã lưu
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navCardBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.purpleLight,
              },
            ]}
            onPress={() => navigation.navigate('AiAssistant')}
            activeOpacity={0.7}
          >
            <Text style={styles.navCardIcon}>🤖</Text>
            <View style={styles.navCardTextCol}>
              <Text style={[styles.navCardTitle, { color: colors.text }]} numberOfLines={1}>
                Gemini AI
              </Text>
              <Text style={[styles.navCardBadge, { color: colors.purple }]} numberOfLines={1}>
                Tư vấn chọn mua
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navCardBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate('NotificationSettings')}
            activeOpacity={0.7}
          >
            <Text style={styles.navCardIcon}>⚙️</Text>
            <View style={styles.navCardTextCol}>
              <Text style={[styles.navCardTitle, { color: colors.text }]} numberOfLines={1}>
                Cài đặt
              </Text>
              <Text style={[styles.navCardBadge, { color: colors.textSecondary }]} numberOfLines={1}>
                Test Matrix
              </Text>
            </View>
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
            🧪 Mô phỏng lỗi API đang kích hoạt (Test Case 2).
          </Text>
          <TouchableOpacity
            onPress={() => toggleSimulationFlag('simulateApiError')}
          >
            <Text style={[styles.simAlertLink, { color: colors.primary }]}>
              Tắt lỗi & Tải lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Floating Modern Search Input */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm theo tên sản phẩm, hãng..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchText.length > 0 ? (
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={() => setSearchText('')}
          >
            <Text style={[styles.clearSearchIcon, { color: colors.textSecondary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Horizontal Category Carousel Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContainer}
      >
        {PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>{cat.icon || '📦'}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results Count & Quick Reset Filter Row */}
      <View style={styles.resultsInfoRow}>
        <Text style={[styles.resultsCountText, { color: colors.textSecondary }]}>
          Tìm thấy <Text style={{ color: colors.primary, fontWeight: '700' }}>{products.length}</Text> / {totalCount} sản phẩm
        </Text>
        {(searchText.length > 0 || selectedCategory !== 'all') ? (
          <TouchableOpacity
            style={[styles.resetFilterBtn, { backgroundColor: colors.dangerLight }]}
            onPress={handleResetFilters}
          >
            <Text style={[styles.resetFilterText, { color: colors.danger }]}>
              ✕ Xóa bộ lọc
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (isLoadingInitial || products.length === 0) return null;

    if (isLoadingMore) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Đang tải thêm sản phẩm mới...
          </Text>
        </View>
      );
    }

    if (!hasMore) {
      return (
        <View style={styles.footerContainer}>
          <View style={[styles.endOfListBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.endOfListText, { color: colors.textSecondary }]}>
              ✓ Bạn đã xem toàn bộ {products.length} sản phẩm
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.loadMorePill,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primary,
          },
        ]}
        onPress={handleLoadMore}
        activeOpacity={0.8}
      >
        <Text style={[styles.loadMoreText, { color: colors.primary }]}>
          ↓ Xem thêm ({products.length}/{totalCount})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={errorMessage ? [] : products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
              title="Đang đồng bộ dữ liệu Catalog..."
              message="Đang kết nối API DummyJSON & chuẩn bị giao diện"
            />
          ) : errorMessage ? (
            <StateFeedback
              type="error"
              title="Lỗi tải danh mục sản phẩm (R01)"
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
              message={`Không có kết quả nào khớp với "${searchText}" trong danh mục đã chọn.`}
              actionLabel="Xóa bộ lọc tìm kiếm"
              onAction={handleResetFilters}
            />
          )
        }
        ListFooterComponent={renderFooter()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handlePullToRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginBottom: 8,
  },
  brandCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  brandTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  authorPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  authorPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 11,
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
  quickNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  navCardBtn: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  navCardIcon: {
    fontSize: 18,
  },
  navCardTextCol: {
    flex: 1,
  },
  navCardTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  navCardBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  simAlertBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 46,
    paddingVertical: Platform.OS === 'android' ? 2 : 6,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryScrollContainer: {
    paddingBottom: 6,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 12,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 4,
    marginBottom: 6,
  },
  resultsCountText: {
    fontSize: 12,
  },
  resetFilterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
  },
  endOfListBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  endOfListText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadMorePill: {
    marginVertical: 12,
    marginHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

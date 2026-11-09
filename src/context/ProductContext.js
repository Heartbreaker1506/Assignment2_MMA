import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { productApi } from '../api/productApi';
import { CONFIG } from '../constants/config';
import { MOCK_PRODUCTS } from '../constants/mockProducts';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  // Pre-seed with mock catalog so UI renders instantaneously without waiting for network
  const [products, setProducts] = useState(MOCK_PRODUCTS.slice(0, 10));
  const [categories, setCategories] = useState(['all', 'smartphones', 'laptops', 'fragrances', 'furniture', 'groceries']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State flags for UX
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination tracking
  const [skip, setSkip] = useState(10);
  const [total, setTotal] = useState(MOCK_PRODUCTS.length);
  const [hasMore, setHasMore] = useState(true);

  // Load category list on mount
  useEffect(() => {
    productApi.fetchCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(['all', ...cats.filter((c) => c !== 'all')]);
        }
      })
      .catch((err) => console.warn('Failed to load categories:', err.message));
  }, []);

  /**
   * Main fetch function (Page 0)
   */
  const loadProducts = useCallback(async ({ search = searchQuery, category = selectedCategory } = {}) => {
    // Only show full loading spinner if we have 0 products
    if (products.length === 0) {
      setLoading(true);
    }
    setError(null);
    setSkip(0);

    try {
      const result = await productApi.fetchProducts({
        limit: CONFIG.DEFAULT_PAGE_SIZE,
        skip: 0,
        search,
        category: category === 'all' ? '' : category,
      });

      setProducts(result.products);
      setTotal(result.total);
      setSkip(result.products.length);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('[ProductContext] Load products error:', err.message);
      // Keep existing products if available, only set error if completely empty
      if (products.length === 0) {
        setError(err.message || 'Lỗi kết nối khi tải danh sách sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, products.length]);

  /**
   * Pull-to-refresh handler
   */
  const refreshProducts = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await productApi.fetchProducts({
        limit: CONFIG.DEFAULT_PAGE_SIZE,
        skip: 0,
        search: searchQuery,
        category: selectedCategory === 'all' ? '' : selectedCategory,
      });

      setProducts(result.products);
      setTotal(result.total);
      setSkip(result.products.length);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err.message || 'Không thể làm mới dữ liệu');
    } finally {
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory]);

  /**
   * Load more pagination handler with strict guards
   * GUARD PREVENTS DUPLICATE CALLS & INFINITE REQUESTS (Bug 1 from Debug section)
   */
  const loadMoreProducts = useCallback(async () => {
    // Strict guard: do not fetch if already fetching, loading, or no more items
    if (loading || isFetchingMore || !hasMore || products.length >= total) {
      return;
    }

    setIsFetchingMore(true);

    try {
      const result = await productApi.fetchProducts({
        limit: CONFIG.DEFAULT_PAGE_SIZE,
        skip: skip,
        search: searchQuery,
        category: selectedCategory === 'all' ? '' : selectedCategory,
      });

      // Deduplicate products by id to prevent duplicate keys in FlatList
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newUnique = result.products.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newUnique];
      });

      setSkip((prev) => prev + result.products.length);
      setHasMore(result.hasMore);
    } catch (err) {
      console.warn('[ProductContext] Load more error:', err.message);
    } finally {
      setIsFetchingMore(false);
    }
  }, [loading, isFetchingMore, hasMore, products.length, total, skip, searchQuery, selectedCategory]);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  /**
   * Filter and search actions
   */
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    loadProducts({ search: query, category: selectedCategory });
  }, [loadProducts, selectedCategory]);

  const handleCategorySelect = useCallback((cat) => {
    setSelectedCategory(cat);
  }, []);

  const retry = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const value = useMemo(() => ({
    products,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    isFetchingMore,
    refreshing,
    error,
    total,
    hasMore,
    loadProducts,
    refreshProducts,
    loadMoreProducts,
    handleSearch,
    handleCategorySelect,
    retry,
  }), [
    products,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    isFetchingMore,
    refreshing,
    error,
    total,
    hasMore,
    loadProducts,
    refreshProducts,
    loadMoreProducts,
    handleSearch,
    handleCategorySelect,
    retry,
  ]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

import { CONFIG } from '../constants/config.js';
import { MOCK_PRODUCTS } from '../constants/mockProducts.js';

/**
 * Product API Service interacting with DummyJSON.
 * Implements pagination (skip & limit), search, category filtering, and item detail retrieval.
 * Includes offline resilience fallback when remote host is unreachable.
 */

// Helper to normalize product entities and guarantee numeric fields
const normalizeProduct = (item) => {
  if (!item) return null;
  return {
    id: Number(item.id),
    title: item.title || 'Sản phẩm không có tên',
    description: item.description || '',
    category: item.category || 'all',
    price: Number(item.price) || 0,
    discountPercentage: Number(item.discountPercentage) || 0,
    rating: Number(item.rating) || 0,
    stock: Number(item.stock) || 0,
    brand: item.brand || 'Thương hiệu',
    thumbnail: item.thumbnail || (item.images && item.images[0]) || 'https://via.placeholder.com/150',
    images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.thumbnail || 'https://via.placeholder.com/300'],
  };
};

export const productApi = {
  /**
   * Fetches products with pagination, search, or category filter
   * @param {Object} params - { limit, skip, search, category }
   */
  async fetchProducts({ limit = CONFIG.DEFAULT_PAGE_SIZE, skip = 0, search = '', category = '' } = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

    try {
      let url = `${CONFIG.API_BASE_URL}/products`;

      if (search && search.trim().length > 0) {
        url = `${CONFIG.API_BASE_URL}/products/search?q=${encodeURIComponent(search.trim())}&limit=${limit}&skip=${skip}`;
      } else if (category && category !== 'all') {
        url = `${CONFIG.API_BASE_URL}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
      } else {
        url = `${CONFIG.API_BASE_URL}/products?limit=${limit}&skip=${skip}`;
      }

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Máy chủ phản hồi lỗi HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawProducts = data.products || [];
      const total = Number(data.total) || 0;
      const normalizedProducts = rawProducts.map(normalizeProduct).filter(Boolean);
      const hasMore = skip + normalizedProducts.length < total;

      return {
        products: normalizedProducts,
        total,
        skip,
        limit,
        hasMore,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('[ProductAPI] Remote fetch failed (' + error.message + '). Using offline catalog fallback.');

      // Intelligent Offline Fallback: Filters and paginates MOCK_PRODUCTS locally
      let filtered = [...MOCK_PRODUCTS];

      if (search && search.trim().length > 0) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      } else if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);
      const hasMore = skip + paginated.length < total;

      return {
        products: paginated.map(normalizeProduct),
        total,
        skip,
        limit,
        hasMore,
      };
    }
  },

  /**
   * Fetches product categories list
   */
  async fetchCategories() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/products/categories`);
      if (!response.ok) throw new Error('Categories fetch failed');
      const data = await response.json();
      return data.map((item) => (typeof item === 'string' ? item : item.slug || item.name));
    } catch (error) {
      // Fallback categories
      return ['all', 'smartphones', 'laptops', 'fragrances', 'furniture', 'groceries'];
    }
  },

  /**
   * Fetches details of a single product
   */
  async fetchProductById(id) {
    if (!id) throw new Error('Mã sản phẩm không hợp lệ');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/products/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Không tìm thấy sản phẩm với ID ${id}`);
        }
        throw new Error(`Lỗi tải chi tiết: HTTP ${response.status}`);
      }

      const data = await response.json();
      return normalizeProduct(data);
    } catch (error) {
      clearTimeout(timeoutId);
      // Offline fallback lookup
      const localItem = MOCK_PRODUCTS.find((p) => p.id === Number(id));
      if (localItem) {
        return normalizeProduct(localItem);
      }
      throw new Error(error.message || `Không thể tải sản phẩm với mã ID ${id}`);
    }
  },
};

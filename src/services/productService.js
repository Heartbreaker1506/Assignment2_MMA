// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/services/productService.js - Gọi API sản phẩm, phân trang & dự phòng
// =========================================================================

import { ENV_CONFIG } from '../config/env';
import { FALLBACK_PRODUCTS, SHOP_CONFIG } from '../constants/theme';

// Chuẩn hóa dữ liệu sản phẩm từ API để tránh lỗi crash do thiếu trường
export const normalizeProduct = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return {
    id: Number(raw.id) || Date.now(),
    title: String(raw.title || 'Sản phẩm chưa đặt tên').trim(),
    description: String(
      raw.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'
    ).trim(),
    price: Number(raw.price) > 0 ? Number(raw.price) : 0,
    discountPercentage: Number(raw.discountPercentage) || 0,
    rating: Number(raw.rating) || 4.5,
    stock: Number.isFinite(Number(raw.stock)) ? Number(raw.stock) : 10,
    brand: String(raw.brand || 'SmartStore').trim(),
    category: String(raw.category || 'general').trim(),
    thumbnail:
      raw.thumbnail ||
      (Array.isArray(raw.images) && raw.images[0]) ||
      'https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/thumbnail.png',
    images:
      Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images
        : [
            raw.thumbnail ||
              'https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/thumbnail.png',
          ],
  };
};

// Tải danh sách sản phẩm phân trang từ Remote API (DummyJSON) kèm tìm kiếm và lọc danh mục
export const fetchProductsPage = async ({
  limit = SHOP_CONFIG.PAGE_LIMIT,
  skip = 0,
  searchQuery = '',
  category = 'all',
  simulateError = false,
} = {}) => {
  // Mô phỏng sự cố mạng để kiểm thử giao diện lỗi và nút Thử lại (Test Case 2)
  if (simulateError) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    throw new Error(
      'Không thể kết nối tới máy chủ sản phẩm (Simulated API Network Error). Vui lòng kiểm tra mạng và bấm Thử lại!'
    );
  }

  const baseUrl = ENV_CONFIG.API_BASE_URL || 'https://dummyjson.com';
  const trimmedSearch = String(searchQuery || '').trim();
  let endpoint = '';

  // Xây dựng endpoint tương ứng theo từ khóa tìm kiếm hoặc danh mục đã chọn
  if (trimmedSearch.length > 0) {
    endpoint = `${baseUrl}/products/search?q=${encodeURIComponent(
      trimmedSearch
    )}&limit=${limit}&skip=${skip}`;
  } else if (category && category !== 'all') {
    endpoint = `${baseUrl}/products/category/${encodeURIComponent(
      category
    )}?limit=${limit}&skip=${skip}`;
  } else {
    endpoint = `${baseUrl}/products?limit=${limit}&skip=${skip}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Lỗi máy chủ API (HTTP ${response.status}). Không thể tải danh mục sản phẩm.`
    );
  }

  const data = await response.json();
  const rawProducts = Array.isArray(data?.products) ? data.products : [];
  const normalizedList = rawProducts
    .map((item) => normalizeProduct(item))
    .filter(Boolean);

  // Lọc thêm theo danh mục phía máy khách nếu người dùng vừa tìm kiếm vừa chọn danh mục
  const finalProducts =
    trimmedSearch.length > 0 && category && category !== 'all'
      ? normalizedList.filter(
          (item) => item.category.toLowerCase() === category.toLowerCase()
        )
      : normalizedList;

  const total =
    trimmedSearch.length > 0 && category && category !== 'all'
      ? finalProducts.length
      : Number(data?.total) || finalProducts.length;

  const hasMore = skip + rawProducts.length < total && rawProducts.length > 0;

  return {
    products: finalProducts,
    total,
    skip,
    limit,
    hasMore,
    source: 'remote_api',
  };
};

// Trả về danh sách sản phẩm từ kho dự phòng ngoại tuyến khi mất kết nối mạng
export const getFallbackProductsPage = ({
  limit = SHOP_CONFIG.PAGE_LIMIT,
  skip = 0,
  searchQuery = '',
  category = 'all',
} = {}) => {
  const trimmedSearch = String(searchQuery || '').trim().toLowerCase();

  const filtered = FALLBACK_PRODUCTS.filter((item) => {
    const matchCategory =
      !category ||
      category === 'all' ||
      item.category.toLowerCase() === category.toLowerCase();

    const matchSearch =
      !trimmedSearch ||
      item.title.toLowerCase().includes(trimmedSearch) ||
      item.description.toLowerCase().includes(trimmedSearch) ||
      item.brand.toLowerCase().includes(trimmedSearch);

    return matchCategory && matchSearch;
  }).map((item) => normalizeProduct(item));

  const paged = filtered.slice(skip, skip + limit);
  const hasMore = skip + paged.length < filtered.length;

  return {
    products: paged,
    total: filtered.length,
    skip,
    limit,
    hasMore,
    source: 'offline_fallback',
  };
};

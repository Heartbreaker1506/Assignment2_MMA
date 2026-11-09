// Author: Trần Minh Quân - Student ID: CE181730

// Light theme palette
export const lightColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1E21',
  textSecondary: '#65676B',
  primary: '#2563EB',
  primaryLight: '#EBF2FF',
  border: '#E4E6EB',
  danger: '#DC3545',
  dangerLight: '#FFEAEA',
  success: '#16A34A',
  successLight: '#E8F5E9',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  accent: '#F59E0B',
  purple: '#7C3AED',
  purpleLight: '#F3E8FF',
  statusBar: 'dark',
};

// Dark theme palette
export const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#242526',
  text: '#E4E6EB',
  textSecondary: '#B0B3B8',
  primary: '#3B82F6',
  primaryLight: '#1E3A5F',
  border: '#3A3B3C',
  danger: '#FF6B6B',
  dangerLight: '#3D1E1E',
  success: '#22C55E',
  successLight: '#1E3D24',
  warning: '#FBBF24',
  warningLight: '#3D2E10',
  accent: '#FFA726',
  purple: '#A78BFA',
  purpleLight: '#2E1F47',
  statusBar: 'light',
};

// Student information displayed in the app
export const STUDENT_INFO = {
  name: 'Trần Minh Quân',
  studentId: 'CE181730',
  email: 'minhquan15062004@gmail.com',
  course: 'MMA301 - Integrated E-Commerce App (Assignment 2)',
};

// Pagination and cart pricing rules
export const SHOP_CONFIG = {
  PAGE_LIMIT: 8, // Number of products per page
  FREE_SHIPPING_THRESHOLD: 100, // Free shipping for orders >= $100
  STANDARD_SHIPPING_FEE: 8, // Standard shipping fee ($8)
  VIP_DISCOUNT_THRESHOLD: 300, // 5% discount for orders >= $300
  VIP_DISCOUNT_RATE: 0.05,
};

// Category filter options for ProductListScreen
export const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'smartphones', label: 'Điện thoại' },
  { id: 'laptops', label: 'Laptop' },
  { id: 'tablets', label: 'Máy tính bảng' },
  { id: 'mobile-accessories', label: 'Phụ kiện' },
  { id: 'mens-watches', label: 'Đồng hồ' },
];

// Offline fallback product catalog when network is unavailable
export const FALLBACK_PRODUCTS = [
  {
    id: 101,
    title: 'iPhone 15 Pro Max 256GB',
    description:
      'Điện thoại iPhone 15 Pro Max khung viền Titan siêu nhẹ, chip A17 Pro mạnh mẽ hỗ trợ chơi game và quay video 4K ProRes.',
    price: 1199,
    discountPercentage: 8.5,
    rating: 4.9,
    stock: 25,
    brand: 'Apple',
    category: 'smartphones',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/thumbnail.png',
  },
  {
    id: 102,
    title: 'Samsung Galaxy S24 Ultra',
    description:
      'Flagship Android tích hợp Galaxy AI, bút S-Pen tiện lợi, camera zoom quang học 5x và màn hình Dynamic AMOLED 2X chống chói.',
    price: 1099,
    discountPercentage: 10.0,
    rating: 4.8,
    stock: 18,
    brand: 'Samsung',
    category: 'smartphones',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/thumbnail.png',
  },
  {
    id: 103,
    title: 'MacBook Air M3 13 inch 16GB/512GB',
    description:
      'Laptop mỏng nhẹ cho sinh viên CNTT và lập trình viên di động, thời lượng pin lên đến 18 giờ, màn hình Liquid Retina sắc nét.',
    price: 1299,
    discountPercentage: 6.0,
    rating: 4.9,
    stock: 12,
    brand: 'Apple',
    category: 'laptops',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png',
  },
  {
    id: 104,
    title: 'ASUS Zenbook 14 OLED Ultra 7',
    description:
      'Laptop trang bị màn hình OLED 2.8K 120Hz chuẩn màu, vi xử lý Intel Core Ultra 7 tích hợp NPU tăng tốc tác vụ AI.',
    price: 950,
    discountPercentage: 12.0,
    rating: 4.7,
    stock: 15,
    brand: 'ASUS',
    category: 'laptops',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/laptops/Asus%20Zenbook%20Pro%20Dual%20Screen%20Laptop/thumbnail.png',
  },
  {
    id: 105,
    title: 'iPad Air M2 11 inch Wi-Fi',
    description:
      'Máy tính bảng hiệu năng cao với chip Apple M2, hỗ trợ Apple Pencil Pro phù hợp ghi chú bài giảng và thiết kế UI/UX.',
    price: 599,
    discountPercentage: 5.5,
    rating: 4.8,
    stock: 30,
    brand: 'Apple',
    category: 'tablets',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/tablets/iPad%20Mini%202021%20Starlight/thumbnail.png',
  },
  {
    id: 106,
    title: 'Tai nghe AirPods Pro Gen 2 USB-C',
    description:
      'Tai nghe không dây chống ồn chủ động ANC gấp 2 lần, chế độ xuyên âm thích ứng và hộp sạc MagSafe cổng USB-C.',
    price: 249,
    discountPercentage: 9.0,
    rating: 4.8,
    stock: 42,
    brand: 'Apple',
    category: 'mobile-accessories',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20Airpods/thumbnail.png',
  },
  {
    id: 107,
    title: 'Sạc dự phòng Anker Prime 20000mAh 100W',
    description:
      'Pin sạc dự phòng công suất cao sạc nhanh được cho cả MacBook, laptop và điện thoại với màn hình thông minh báo dòng điện.',
    price: 89,
    discountPercentage: 15.0,
    rating: 4.6,
    stock: 50,
    brand: 'Anker',
    category: 'mobile-accessories',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20MagSafe%20Battery%20Pack/thumbnail.png',
  },
  {
    id: 108,
    title: 'Đồng hồ thông minh Apple Watch Series 9',
    description:
      'Đồng hồ theo dõi sức khỏe, nhịp tim, giấc ngủ và nhận thông báo đẩy nhanh chóng từ ứng dụng mua sắm.',
    price: 399,
    discountPercentage: 7.0,
    rating: 4.7,
    stock: 20,
    brand: 'Apple',
    category: 'mens-watches',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20Watch%20Series%204%20Gold/thumbnail.png',
  },
];

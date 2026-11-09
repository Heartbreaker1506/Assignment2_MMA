// Author: Nguyễn Minh Quân - Student ID: CE180048

// Modern Tech-Luxury Palette (Teal & Indigo Neon)
export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#0D9488',          // Deep Teal
  primaryDark: '#0F766E',
  primaryLight: '#CCFBF1',
  secondary: '#6366F1',        // Electric Indigo
  secondaryLight: '#EEF2FF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  accent: '#F59E0B',
  purple: '#8B5CF6',
  purpleLight: '#F3E8FF',
  gold: '#D97706',
  goldLight: '#FEF3C7',
  statusBar: 'dark',
};

// Deep Obsidian Night Theme
export const darkColors = {
  background: '#0B0F17',      // Deep Obsidian
  surface: '#111827',
  card: '#161F30',           // Midnight Slate
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  primary: '#14B8A6',          // Neon Teal
  primaryDark: '#0D9488',
  primaryLight: '#134E4A',
  secondary: '#818CF8',        // Neon Indigo
  secondaryLight: '#1E1B4B',
  border: '#1E293B',
  borderLight: '#0F172A',
  danger: '#F87171',
  dangerLight: '#450A0A',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#451A03',
  accent: '#FBBF24',
  purple: '#A78BFA',
  purpleLight: '#2E1065',
  gold: '#FBBF24',
  goldLight: '#3D2506',
  statusBar: 'light',
};

// Student Information
export const STUDENT_INFO = {
  name: 'Nguyễn Minh Quân',
  studentId: 'CE180048',
  email: 'QuanNMCE180048@fpt.edu.vn',
  course: 'MMA301 - Integrated E-Commerce App (Assignment 2)',
  brandName: 'SmartStore',
};

// Pricing and Shipping Rules
export const SHOP_CONFIG = {
  PAGE_LIMIT: 8,
  FREE_SHIPPING_THRESHOLD: 100,
  STANDARD_SHIPPING_FEE: 8,
  VIP_DISCOUNT_THRESHOLD: 300,
  VIP_DISCOUNT_RATE: 0.05,
};

// Product Categories with Icons
export const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: '✨' },
  { id: 'smartphones', label: 'Điện thoại', icon: '📱' },
  { id: 'laptops', label: 'Laptop', icon: '💻' },
  { id: 'tablets', label: 'Máy tính bảng', icon: '📟' },
  { id: 'mobile-accessories', label: 'Phụ kiện', icon: '🎧' },
  { id: 'mens-watches', label: 'Đồng hồ', icon: '⌚' },
];

// Fallback products with high-resolution visuals
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

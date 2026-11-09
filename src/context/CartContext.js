// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/context/CartContext.js - Quản lý Giỏ hàng, Derived Totals & Lưu AsyncStorage (R05, R06, R07)
// =========================================================================

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import { SHOP_CONFIG } from '../constants/theme';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartHydrated, setIsCartHydrated] = useState(false);

  // Khôi phục danh sách mặt hàng trong giỏ từ AsyncStorage khi khởi động app
  useEffect(() => {
    const loadCartFromStorage = async () => {
      const savedCart = await getStoredItem(STORAGE_KEYS.CART, []);
      if (Array.isArray(savedCart)) {
        const validItems = savedCart.filter(
          (item) =>
            item &&
            item.product &&
            item.product.id !== undefined &&
            Number(item.quantity) > 0
        );
        setCartItems(validItems);
      }
      setIsCartHydrated(true);
    };
    loadCartFromStorage();
  }, []);

  // Cập nhật state giỏ hàng và lưu đồng thời xuống AsyncStorage (Single Source of Truth)
  const persistCart = async (nextItems) => {
    setCartItems(nextItems);
    await setStoredItem(STORAGE_KEYS.CART, nextItems);
  };

  // Thêm sản phẩm vào giỏ hoặc tăng số lượng nếu đã tồn tại
  const addToCart = async (product, quantityToAdd = 1, note = '') => {
    if (!product || product.id === undefined) return;
    const safeQty = Math.max(1, Number(quantityToAdd) || 1);

    const existingIndex = cartItems.findIndex(
      (item) => Number(item.product.id) === Number(product.id)
    );

    let updatedList = [];
    if (existingIndex >= 0) {
      updatedList = cartItems.map((item, idx) => {
        if (idx !== existingIndex) return item;
        return {
          ...item,
          quantity: item.quantity + safeQty,
          note: note ? String(note).trim() : item.note,
        };
      });
    } else {
      updatedList = [
        ...cartItems,
        {
          product,
          quantity: safeQty,
          note: String(note || '').trim(),
          addedAt: new Date().toISOString(),
        },
      ];
    }

    await persistCart(updatedList);
  };

  // Cập nhật số lượng sản phẩm; tự động xóa khỏi giỏ nếu số lượng giảm về <= 0
  const updateQuantity = async (productId, newQuantity) => {
    const numericQty = Number(newQuantity);
    if (Number.isNaN(numericQty) || numericQty <= 0) {
      await removeFromCart(productId);
      return;
    }

    const updatedList = cartItems.map((item) =>
      Number(item.product.id) === Number(productId)
        ? { ...item, quantity: Math.floor(numericQty) }
        : item
    );
    await persistCart(updatedList);
  };

  // Tăng 1 đơn vị số lượng
  const incrementQuantity = async (productId) => {
    const found = cartItems.find(
      (item) => Number(item.product.id) === Number(productId)
    );
    if (found) {
      await updateQuantity(productId, found.quantity + 1);
    }
  };

  // Giảm 1 đơn vị số lượng
  const decrementQuantity = async (productId) => {
    const found = cartItems.find(
      (item) => Number(item.product.id) === Number(productId)
    );
    if (found) {
      await updateQuantity(productId, found.quantity - 1);
    }
  };

  // Cập nhật ghi chú riêng cho từng mặt hàng trong giỏ
  const updateItemNote = async (productId, note) => {
    const updatedList = cartItems.map((item) =>
      Number(item.product.id) === Number(productId)
        ? { ...item, note: String(note || '') }
        : item
    );
    await persistCart(updatedList);
  };

  // Xóa một sản phẩm cụ thể khỏi giỏ hàng
  const removeFromCart = async (productId) => {
    const updatedList = cartItems.filter(
      (item) => Number(item.product.id) !== Number(productId)
    );
    await persistCart(updatedList);
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    await persistCart([]);
  };

  // Lấy số lượng hiện tại của sản phẩm trong giỏ hàng
  const getProductQuantityInCart = (productId) => {
    const found = cartItems.find(
      (item) => Number(item.product.id) === Number(productId)
    );
    return found ? found.quantity : 0;
  };

  // Tính toán bảng giá phái sinh (Derived Totals) qua useMemo theo đúng chuẩn kiến trúc R06
  const cartSummary = useMemo(() => {
    const totalItems = cartItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const uniqueItemsCount = cartItems.length;

    const subtotal = cartItems.reduce(
      (sum, item) =>
        sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
      0
    );

    // Ưu đãi giảm giá 5% khi tổng tiền đơn hàng đạt từ $300 trở lên
    const discountAmount =
      subtotal >= SHOP_CONFIG.VIP_DISCOUNT_THRESHOLD
        ? Number((subtotal * SHOP_CONFIG.VIP_DISCOUNT_RATE).toFixed(2))
        : 0;

    // Phí vận chuyển tiêu chuẩn $8.00; tự động Miễn phí khi đơn hàng từ $100 trở lên (hoặc giỏ trống)
    const shippingFee =
      subtotal === 0 || subtotal >= SHOP_CONFIG.FREE_SHIPPING_THRESHOLD
        ? 0
        : SHOP_CONFIG.STANDARD_SHIPPING_FEE;

    // Tổng tiền thanh toán cuối cùng
    const finalTotal = Math.max(
      0,
      Number((subtotal - discountAmount + shippingFee).toFixed(2))
    );

    return {
      totalItems,
      uniqueItemsCount,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount,
      shippingFee,
      finalTotal,
      qualifiesForFreeShipping:
        subtotal >= SHOP_CONFIG.FREE_SHIPPING_THRESHOLD,
      qualifiesForVipDiscount: subtotal >= SHOP_CONFIG.VIP_DISCOUNT_THRESHOLD,
    };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartHydrated,
        cartSummary,
        addToCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        updateItemNote,
        removeFromCart,
        clearCart,
        getProductQuantityInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook tiện ích để sử dụng CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
};

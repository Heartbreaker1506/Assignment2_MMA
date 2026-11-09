// Author: Nguyễn Minh Quân - Student ID: CE180048

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

  // Restore cart items from AsyncStorage on startup
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

  // Update cart state and save to AsyncStorage
  const persistCart = async (nextItems) => {
    setCartItems(nextItems);
    await setStoredItem(STORAGE_KEYS.CART, nextItems);
  };

  // Add a product to cart or increment quantity if it already exists
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

  // Update item quantity; automatically remove item if quantity is <= 0
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

  const incrementQuantity = async (productId) => {
    const found = cartItems.find(
      (item) => Number(item.product.id) === Number(productId)
    );
    if (found) {
      await updateQuantity(productId, found.quantity + 1);
    }
  };

  const decrementQuantity = async (productId) => {
    const found = cartItems.find(
      (item) => Number(item.product.id) === Number(productId)
    );
    if (found) {
      await updateQuantity(productId, found.quantity - 1);
    }
  };

  // Update custom note for a specific cart item
  const updateItemNote = async (productId, note) => {
    const updatedList = cartItems.map((item) =>
      Number(item.product.id) === Number(productId)
        ? { ...item, note: String(note || '') }
        : item
    );
    await persistCart(updatedList);
  };

  // Remove a single product from cart
  const removeFromCart = async (productId) => {
    const updatedList = cartItems.filter(
      (item) => Number(item.product.id) !== Number(productId)
    );
    await persistCart(updatedList);
  };

  // Clear all items from cart
  const clearCart = async () => {
    await persistCart([]);
  };

  // Get current quantity of a product in cart
  const getProductQuantityInCart = (productId) => {
    const found = cartItems.find(
      (item) => Number(item.product.id) === Number(productId)
    );
    return found ? found.quantity : 0;
  };

  // Compute derived cart totals from cartItems using useMemo (Single Source of Truth)
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

    const discountAmount =
      subtotal >= SHOP_CONFIG.VIP_DISCOUNT_THRESHOLD
        ? Number((subtotal * SHOP_CONFIG.VIP_DISCOUNT_RATE).toFixed(2))
        : 0;

    const shippingFee =
      subtotal === 0 || subtotal >= SHOP_CONFIG.FREE_SHIPPING_THRESHOLD
        ? 0
        : SHOP_CONFIG.STANDARD_SHIPPING_FEE;

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storageService } from '../services/storageService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isRestored, setIsRestored] = useState(false);

  // Restore cart state from AsyncStorage on app launch (R07 requirement)
  useEffect(() => {
    const restoreCart = async () => {
      try {
        const saved = await storageService.getCart();
        if (Array.isArray(saved)) {
          setCartItems(saved);
        }
      } catch (err) {
        console.error('[CartContext] Failed to restore cart:', err);
      } finally {
        setIsRestored(true);
      }
    };
    restoreCart();
  }, []);

  // Save cart state to AsyncStorage whenever cartItems change
  useEffect(() => {
    if (isRestored) {
      storageService.saveCart(cartItems);
    }
  }, [cartItems, isRestored]);

  /**
   * Add product to cart with quantity and optional note
   */
  const addToCart = useCallback((product, quantity = 1, note = '') => {
    if (!product || !product.id) return;
    const qty = Math.max(1, Number(quantity) || 1);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = Number(updated[existingIndex].quantity) || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + qty,
          note: note || updated[existingIndex].note || '',
        };
        return updated;
      }
      return [...prev, { product, quantity: qty, note: note || '' }];
    });
  }, []);

  /**
   * Update quantity by delta (+1 or -1)
   */
  const updateQuantity = useCallback((productId, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = (Number(item.quantity) || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean); // removes items when quantity drops to 0
    });
  }, []);

  /**
   * Remove specific item from cart
   */
  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  /**
   * Update custom note for a cart item (Transfer task friendly)
   */
  const updateItemNote = useCallback((productId, note) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, note } : item))
    );
  }, []);

  /**
   * Clear entire cart after successful checkout
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /**
   * DERIVED TOTALS (R06 - Cart selector / logic)
   * Computed synchronously from cartItems state to prevent out-of-sync or calculation bugs
   */
  const totals = useMemo(() => {
    const itemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

    const subtotal = cartItems.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);

    // Promotion rule: 10% off for carts over $100
    const discount = subtotal >= 100 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;

    // Shipping rule: $5 flat rate, free above $150
    const shippingFee = subtotal > 0 && subtotal < 150 ? 5.0 : 0.0;

    const totalAmount = Math.max(0, Math.round((subtotal - discount + shippingFee) * 100) / 100);

    return {
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      shippingFee,
      totalAmount,
    };
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      isRestored,
      addToCart,
      updateQuantity,
      removeFromCart,
      updateItemNote,
      clearCart,
      ...totals,
    }),
    [cartItems, isRestored, addToCart, updateQuantity, removeFromCart, updateItemNote, clearCart, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


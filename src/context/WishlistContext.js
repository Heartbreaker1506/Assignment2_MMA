import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseService } from '../services/firebaseService';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore wishlist on app mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const saved = await firebaseService.fetchWishlist();
        if (Array.isArray(saved)) {
          setWishlist(saved);
        }
      } catch (err) {
        console.warn('[WishlistContext] Load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  // Check if item is in wishlist
  const isFavorite = useCallback(
    (productId) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist]
  );

  // Toggle favorite state and sync with Firebase
  const toggleWishlist = useCallback(async (product) => {
    if (!product || !product.id) return;

    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      const updated = exists
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product];

      // Async sync in background
      firebaseService.syncWishlist(updated);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      wishlist,
      loading,
      isFavorite,
      toggleWishlist,
    }),
    [wishlist, loading, isFavorite, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

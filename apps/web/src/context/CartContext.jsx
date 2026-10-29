import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/apiClient.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const local = window.localStorage.getItem('tokonusa_cart');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Save to localStorage whenever local cart changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('tokonusa_cart', JSON.stringify(items));
    }
  }, [items]);

  // Sync with backend when authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await apiClient.cart.getCart();
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data?.items && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.warn('Failed to fetch remote cart:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (product, quantity = 1, variant = null) => {
    setIsLoading(true);
    try {
      const payload = {
        productId: product.id || product.productId,
        productName: product.name || product.title,
        price: product.price,
        imageUrl: product.imageUrl || product.images?.[0]?.imageUrl || product.images?.[0] || '',
        variantId: variant?.id || null,
        variantName: variant?.name || null,
        merchantId: product.merchantId || product.merchant_id || 'm-1',
        merchantName: product.merchantName || product.merchant_name || 'TokoNusa Official',
        quantity: Number(quantity) || 1,
      };

      if (isAuthenticated) {
        const added = await apiClient.cart.addItem(payload);
        await fetchCart();
      } else {
        setItems((prevItems) => {
          const existingIndex = prevItems.findIndex(
            (item) => item.productId === payload.productId && item.variantId === payload.variantId
          );
          if (existingIndex > -1) {
            const updated = [...prevItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + payload.quantity,
            };
            return updated;
          }
          return [
            ...prevItems,
            {
              id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              isSelected: true,
              ...payload,
            },
          ];
        });
      }

      showToast(`Berhasil menambahkan ${product.name || 'produk'} ke keranjang!`, 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan ke keranjang', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchCart, showToast]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    if (isAuthenticated) {
      try {
        await apiClient.cart.updateQuantity(itemId, quantity);
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        );
      } catch (err) {
        showToast(err.message || 'Gagal memperbarui jumlah', 'error');
      }
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  }, [isAuthenticated, showToast]);

  const removeItem = useCallback(async (itemId) => {
    if (isAuthenticated) {
      try {
        await apiClient.cart.removeItem(itemId);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        showToast('Produk dihapus dari keranjang', 'info');
      } catch (err) {
        showToast(err.message || 'Gagal menghapus produk', 'error');
      }
    } else {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      showToast('Produk dihapus dari keranjang', 'info');
    }
  }, [isAuthenticated, showToast]);

  const toggleSelectItem = useCallback(async (itemId, isSelected) => {
    if (isAuthenticated) {
      try {
        await apiClient.cart.toggleSelect(itemId, isSelected);
      } catch {
        // optimistic update continues
      }
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isSelected } : item))
    );
  }, [isAuthenticated]);

  const toggleSelectAll = useCallback((isSelected) => {
    setItems((prev) => prev.map((item) => ({ ...item, isSelected })));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Total quantity of all items in cart
  const totalItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [items]);

  // Selected items calculation
  const selectedItems = useMemo(() => {
    return items.filter((item) => item.isSelected !== false);
  }, [items]);

  const totalSelectedPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [selectedItems]);

  const value = {
    items,
    itemCount: totalItemCount,
    selectedItems,
    totalSelectedPrice,
    isLoading,
    toast,
    showToast,
    hideToast,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    toggleSelectItem,
    toggleSelectAll,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-20 md:bottom-8 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 text-white rounded-xl shadow-2xl border border-slate-700 animate-slide-up backdrop-blur-md max-w-sm text-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'error'
                ? 'bg-rose-500'
                : toast.type === 'info'
                ? 'bg-blue-400'
                : 'bg-emerald-400'
            }`}
          />
          <p className="flex-1 font-medium">{toast.message}</p>
          <button
            onClick={hideToast}
            className="text-slate-400 hover:text-white transition-colors text-xs font-semibold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;

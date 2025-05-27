import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchCartCount = async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    
    try {
      const response = await api.get('/cart/count');
      setCartCount(response.data.count);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching cart count:', err);
      // Don't set error state for count - it's not critical
      // Just keep the previous count
    }
  };

  const fetchCartItems = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCartItems(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      if (!err.response) {
        setError('Failed to connect to server. Please check your connection.');
      } else {
        setError('Failed to load cart items. Please try again later.');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
      fetchCartItems();
    } else {
      setCartItems([]);
      setCartCount(0);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (itemId: string, quantity: number = 1) => {
    try {
      await api.post('/cart', { itemId, quantity });
      // Update cart count and items after adding
      fetchCartCount();
      fetchCartItems();
      return { success: true };
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to add item to cart' 
      };
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      // Update cart count and items after updating
      fetchCartCount();
      fetchCartItems();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update cart item' 
      };
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      // Update cart count and items after removing
      fetchCartCount();
      fetchCartItems();
      return { success: true };
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to remove item from cart' 
      };
    }
  };

  // Get cart items - returns the current items or fetches fresh ones
  const getCart = async () => {
    try {
      if (!isAuthenticated) {
        return [];
      }
      
      const response = await api.get('/cart');
      return response.data;
    } catch (err: any) {
      console.error('Error getting cart items:', err);
      throw new Error(err.response?.data?.message || 'Failed to get cart items');
    }
  };

  // Function to handle bargain requests
  const bargainItem = async (itemId: string, price: number, message: string) => {
    try {
      await api.post(`/cart/${itemId}/bargain`, { price, message });
      fetchCartCount();
      return true;
    } catch (err: any) {
      console.error('Error sending bargain request:', err);
      return false;
    }
  };

  return {
    cartItems,
    cartCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    refreshCart: fetchCartItems,
    refreshCartCount: fetchCartCount,
    getCart,
    bargainItem,
    isLoading: loading
  };
};
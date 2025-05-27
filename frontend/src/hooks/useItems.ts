import { useState, useEffect } from 'react';
import api from '@/lib/api';

export const useItems = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get('/items', { signal });
        setItems(response.data);
        setError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        console.error('Error fetching items:', err);
        if (!err.response) {
          setError('Failed to connect to server. Please check your internet connection and try again.');
        } else {
          setError('Failed to load items. Please try again later.');
        }
        // Set empty array to prevent undefined errors
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort();
    };
  }, []);

  const createItem = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await api.post('/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: any) {
      console.error('Error creating item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await api.delete(`/items/${itemId}`);
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      return false;
    }
  };

  return { items, loading, error, createItem, deleteItem };
};
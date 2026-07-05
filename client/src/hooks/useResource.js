import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

export function useResource(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint, { params });
      setItems(data.items || []);
    } catch (error) {
      toast.error(error.friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (payload, config) => {
    const { data } = await api.post(endpoint, payload, config);
    setItems((current) => [data.item, ...current]);
    return data.item;
  };

  const update = async (id, payload, config) => {
    const { data } = await api.put(`${endpoint}/${id}`, payload, config);
    setItems((current) => current.map((item) => (item._id === id ? data.item : item)));
    return data.item;
  };

  const remove = async (id) => {
    await api.delete(`${endpoint}/${id}`);
    setItems((current) => current.filter((item) => item._id !== id));
  };

  return { items, loading, load, create, update, remove, setItems };
}

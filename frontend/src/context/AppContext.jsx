import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [stores, setStores] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API = '/api';

  const fetchRecommendations = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API}/inventory/recommendations${query ? `?${query}` : ''}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/stores`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStores(data.stores || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/inventory/transfers`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setTransfers(data.transfers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const executeTransfer = useCallback(async (payload) => {
    const res = await fetch(`${API}/inventory/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  }, [API]);

  return (
    <AppContext.Provider
      value={{
        stores,
        recommendations,
        transfers,
        loading,
        error,
        fetchStores,
        fetchRecommendations,
        fetchTransfers,
        executeTransfer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

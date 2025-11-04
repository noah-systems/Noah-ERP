import { useCallback, useEffect, useState } from 'react';

import { api, ApiError } from '@/services/api';
import type { Cancellation, CancellationPayload } from '@/types/api';

export function useCancellations() {
  const [items, setItems] = useState<Cancellation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Cancellation[]>('/cancellations');
      setItems(data);
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível carregar cancelamentos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const createCancellation = useCallback(
    async (payload: CancellationPayload) => {
      const { data } = await api.post<Cancellation>('/cancellations', payload);
      setItems((prev) => [data, ...prev]);
      return data;
    },
    []
  );

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    createCancellation,
  };
}

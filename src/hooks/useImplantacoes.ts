import { useCallback, useEffect, useState } from 'react';

import { api, ApiError } from '@/services/api';
import type {
  Implementation,
  ImplementationPayload,
  ImplementationStatus,
  ImplementationUpdatePayload,
} from '@/types/api';

export function useImplantacoes() {
  const [items, setItems] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Implementation[]>('/implants');
      setItems(sortImplementations(data));
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível carregar as implantações.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const schedule = useCallback(
    async (payload: ImplementationPayload) => {
      const created = await api.post<Implementation>('/implants', payload);
      setItems((prev) => sortImplementations([...prev, created]));
      return created;
    },
    []
  );

  const update = useCallback(
    async (id: string, payload: ImplementationUpdatePayload) => {
      const updated = await api.put<Implementation>(`/implants/${id}`, payload);
      setItems((prev) => sortImplementations(prev.map((item) => (item.id === id ? updated : item))));
      return updated;
    },
    []
  );

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    schedule,
    update,
  };
}

export const implementationStatusLabels: Record<ImplementationStatus, string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

function sortImplementations(list: Implementation[]): Implementation[] {
  return [...list].sort((a, b) => {
    const dateDiff = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

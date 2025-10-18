import { useCallback, useEffect, useMemo, useState } from 'react';

import { api, ApiError } from '@/services/api';
import type { Opportunity, OpportunityPayload, OpportunityStage } from '@/types/api';

const OPPORTUNITY_STAGE_ORDER: OpportunityStage[] = [
  'NEGOCIACAO',
  'APRESENTACAO',
  'PROPOSTA',
  'TRIAL',
  'VENC_TRIAL',
  'VENDAS',
];

function sortOpportunities(list: Opportunity[]): Opportunity[] {
  return [...list].sort((a, b) => {
    const stageDiff = OPPORTUNITY_STAGE_ORDER.indexOf(a.stage) - OPPORTUNITY_STAGE_ORDER.indexOf(b.stage);
    if (stageDiff !== 0) return stageDiff;
    if (a.order !== b.order) return a.order - b.order;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Opportunity[]>('/opps');
      setOpportunities(sortOpportunities(data));
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível carregar as oportunidades.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOpportunities();
  }, [fetchOpportunities]);

  const createOpportunity = useCallback(
    async (payload: OpportunityPayload) => {
      const created = await api.post<Opportunity>('/opps', payload);
      setOpportunities((prev) => sortOpportunities([...prev, created]));
      return created;
    },
    []
  );

  const updateOpportunity = useCallback(
    async (id: string, payload: Partial<OpportunityPayload>) => {
      const updated = await api.put<Opportunity>(`/opps/${id}`, payload);
      setOpportunities((prev) => sortOpportunities(prev.map((item) => (item.id === id ? updated : item))));
      return updated;
    },
    []
  );

  const deleteOpportunity = useCallback(async (id: string) => {
    await api.delete(`/opps/${id}`);
    setOpportunities((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const moveOpportunity = useCallback(
    async (id: string, stage: OpportunityStage, position = 0) => {
      const updated = await api.put<Opportunity>(`/opps/${id}/move`, { stage, position });
      setOpportunities((prev) => sortOpportunities([...prev.filter((item) => item.id !== id), updated]));
      return updated;
    },
    []
  );

  const grouped = useMemo(() => {
    return OPPORTUNITY_STAGE_ORDER.reduce<Record<OpportunityStage, Opportunity[]>>(
      (acc, stage) => {
        acc[stage] = opportunities.filter((item) => item.stage === stage);
        return acc;
      },
      {
        NEGOCIACAO: [],
        APRESENTACAO: [],
        PROPOSTA: [],
        TRIAL: [],
        VENC_TRIAL: [],
        VENDAS: [],
      }
    );
  }, [opportunities]);

  return {
    opportunities,
    grouped,
    loading,
    error,
    refetch: fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    moveOpportunity,
  };
}

export const opportunityStageLabels: Record<OpportunityStage, string> = {
  NEGOCIACAO: 'Negociação',
  APRESENTACAO: 'Apresentação',
  PROPOSTA: 'Proposta',
  TRIAL: 'Trial',
  VENC_TRIAL: 'Venc. Trial',
  VENDAS: 'Vendas',
};

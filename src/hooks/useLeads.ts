import { useCallback, useEffect, useMemo, useState } from 'react';

import { api, ApiError } from '@/services/api';
import type { Lead, LeadPayload, LeadStage } from '@/types/api';

const LEAD_STAGE_ORDER: LeadStage[] = ['NUTRICAO', 'QUALIFICADO', 'NAO_QUALIFICADO'];

function sortLeads(list: Lead[]): Lead[] {
  return [...list].sort((a, b) => {
    const stageDiff = LEAD_STAGE_ORDER.indexOf(a.stage) - LEAD_STAGE_ORDER.indexOf(b.stage);
    if (stageDiff !== 0) return stageDiff;
    if (a.order !== b.order) return a.order - b.order;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Lead[]>('/leads');
      setLeads(sortLeads(data));
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível carregar os leads.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const createLead = useCallback(
    async (payload: LeadPayload) => {
      const { data } = await api.post<Lead>('/leads', payload);
      setLeads((prev) => sortLeads([...prev, data]));
      return data;
    },
    []
  );

  const updateLead = useCallback(
    async (id: string, payload: Partial<LeadPayload>) => {
      const { data } = await api.put<Lead>(`/leads/${id}`, payload);
      setLeads((prev) => sortLeads(prev.map((lead) => (lead.id === id ? data : lead))));
      return data;
    },
    []
  );

  const deleteLead = useCallback(async (id: string) => {
    await api.delete(`/leads/${id}`);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  const moveLead = useCallback(
    async (id: string, stage: LeadStage, position = 0) => {
      const { data } = await api.put<Lead>(`/leads/${id}/move`, { stage, position });
      setLeads((prev) => sortLeads([...prev.filter((lead) => lead.id !== id), data]));
      return data;
    },
    []
  );

  const grouped = useMemo(() => {
    return LEAD_STAGE_ORDER.reduce<Record<LeadStage, Lead[]>>(
      (acc, stage) => {
        acc[stage] = leads.filter((lead) => lead.stage === stage);
        return acc;
      },
      {
        NUTRICAO: [],
        QUALIFICADO: [],
        NAO_QUALIFICADO: [],
      }
    );
  }, [leads]);

  return {
    leads,
    grouped,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    moveLead,
  };
}

export const leadStageLabels: Record<LeadStage, string> = {
  NUTRICAO: 'Nutrição',
  QUALIFICADO: 'Qualificado',
  NAO_QUALIFICADO: 'Não Qualificado',
};

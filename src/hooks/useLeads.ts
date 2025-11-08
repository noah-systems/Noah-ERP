import { useCallback, useEffect, useMemo, useState } from 'react';
import { createLead as apiCreateLead, getLeads, moveLead as apiMoveLead, updateLead as apiUpdateLead } from '@/lib/api';
import type { Lead, LeadPayload, LeadStatus } from '@/types/api';

const ORDER: LeadStatus[] = ['NURTURING', 'QUALIFIED', 'DISQUALIFIED'];

function emptyGrouped(): Record<LeadStatus, Lead[]> {
  return {
    NURTURING: [],
    QUALIFIED: [],
    DISQUALIFIED: [],
  };
}

export function useLeads(search?: string) {
  const [grouped, setGrouped] = useState<Record<LeadStatus, Lead[]>>(emptyGrouped);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { grouped: response } = await getLeads(search?.trim() || undefined);
      setGrouped({
        NURTURING: response.NURTURING ?? [],
        QUALIFIED: response.QUALIFIED ?? [],
        DISQUALIFIED: response.DISQUALIFIED ?? [],
      });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível carregar os leads.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const leads = useMemo(() => ORDER.flatMap((status) => grouped[status] ?? []), [grouped]);

  const createLead = useCallback(async (payload: LeadPayload) => {
    const lead = await apiCreateLead(payload);
    setGrouped((prev) => ({
      ...prev,
      NURTURING: [lead, ...prev.NURTURING],
    }));
    return lead;
  }, []);

  const updateLead = useCallback(async (id: string, payload: Partial<LeadPayload>) => {
    const lead = await apiUpdateLead(id, payload);
    setGrouped((prev) => {
      const next = emptyGrouped();
      for (const status of ORDER) {
        next[status] = prev[status].map((item) => (item.id === id ? lead : item));
      }
      return next;
    });
    return lead;
  }, []);

  const moveLead = useCallback(async (id: string, status: LeadStatus) => {
    const lead = await apiMoveLead(id, status);
    setGrouped((prev) => {
      const next = emptyGrouped();
      for (const stage of ORDER) {
        const list = prev[stage];
        if (stage === status) {
          next[stage] = [lead, ...list.filter((item) => item.id !== id)];
        } else {
          next[stage] = list.filter((item) => item.id !== id);
        }
      }
      return next;
    });
    return lead;
  }, []);

  const refetch = useCallback(() => fetchLeads(), [fetchLeads]);

  return {
    leads,
    grouped,
    loading,
    error,
    refetch,
    createLead,
    updateLead,
    moveLead,
  };
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  NURTURING: 'Nutrição',
  QUALIFIED: 'Qualificado',
  DISQUALIFIED: 'Não Qualificado',
};

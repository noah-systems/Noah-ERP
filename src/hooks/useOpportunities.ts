import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createOpp,
  getOpps,
  markOppLost,
  moveOpp,
  updateOpp,
} from '@/lib/api';
import type {
  CreateOpportunityPayload,
  Opportunity,
  OpportunityGroupedResponse,
  OpportunityStage,
  UpdateOpportunityPayload,
} from '@/types/api';

export const OPPORTUNITY_STAGE_ORDER: OpportunityStage[] = [
  'NEGOTIATION',
  'PRESENTATION',
  'PROPOSAL',
  'TRIAL',
  'TRIAL_EXPIRING',
  'WON',
  'LOST',
];

export const opportunityStageLabels: Record<OpportunityStage, string> = {
  NEGOTIATION: 'Negociação',
  PRESENTATION: 'Apresentação',
  PROPOSAL: 'Proposta',
  TRIAL: 'Trial',
  TRIAL_EXPIRING: 'Venc. Trial',
  WON: 'Efetivada',
  LOST: 'Perdida',
};

export type GroupedOpportunities = Record<OpportunityStage, Opportunity[]>;

function createEmptyGrouped(): GroupedOpportunities {
  return OPPORTUNITY_STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = [];
    return acc;
  }, {} as GroupedOpportunities);
}

function sortStage(list: Opportunity[]): Opportunity[] {
  return [...list].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });
}

function normalizeGrouped(data: OpportunityGroupedResponse['grouped']): GroupedOpportunities {
  const grouped = createEmptyGrouped();
  for (const stage of OPPORTUNITY_STAGE_ORDER) {
    const items = Array.isArray(data?.[stage]) ? data[stage] : [];
    grouped[stage] = sortStage(items);
  }
  return grouped;
}

function applyOpportunity(grouped: GroupedOpportunities, opportunity: Opportunity): GroupedOpportunities {
  const next = createEmptyGrouped();
  for (const stage of OPPORTUNITY_STAGE_ORDER) {
    next[stage] = grouped[stage].filter((item) => item.id !== opportunity.id);
  }
  next[opportunity.stage] = sortStage([...next[opportunity.stage], opportunity]);
  return next;
}

export function useOpportunities(search?: string) {
  const [grouped, setGrouped] = useState<GroupedOpportunities>(() => createEmptyGrouped());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOpps(search);
      setGrouped(normalizeGrouped(response.grouped));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível carregar as oportunidades.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchOpportunities();
  }, [fetchOpportunities]);

  const opportunities = useMemo(
    () => OPPORTUNITY_STAGE_ORDER.flatMap((stage) => grouped[stage] ?? []),
    [grouped],
  );

  const createOpportunity = useCallback(
    async (payload: CreateOpportunityPayload) => {
      const created = await createOpp(payload);
      setGrouped((prev) => applyOpportunity(prev, created));
      return created;
    },
    [],
  );

  const updateOpportunity = useCallback(
    async (id: string, payload: UpdateOpportunityPayload) => {
      const updated = await updateOpp(id, payload);
      setGrouped((prev) => applyOpportunity(prev, updated));
      return updated;
    },
    [],
  );

  const moveOpportunity = useCallback(
    async (id: string, stage: OpportunityStage) => {
      const updated = await moveOpp(id, stage);
      setGrouped((prev) => applyOpportunity(prev, updated));
      return updated;
    },
    [],
  );

  const markOpportunityLost = useCallback(
    async (id: string, reason?: string) => {
      const updated = await markOppLost(id, { reason });
      setGrouped((prev) => applyOpportunity(prev, updated));
      return updated;
    },
    [],
  );

  return {
    grouped,
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    moveOpportunity,
    markOpportunityLost,
  };
}

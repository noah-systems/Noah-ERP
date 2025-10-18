import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient, getErrorMessage } from '@/services/api';
import type { Opportunity, OpportunityStage } from '@/types/domain';

export interface OpportunityPayload {
  name: string;
  value?: number | null;
  contactName?: string;
  leadId?: string;
  modules?: string[];
  stage?: OpportunityStage;
  trialEndsAt?: string | null;
  workspaceSlug?: string | null;
}

const OPPS_KEY = ['opportunities'];

export function useOpportunities() {
  const queryClient = useQueryClient();

  const oppsQuery = useQuery({
    queryKey: OPPS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<Opportunity[]>('/opps');
      return data;
    },
  });

  const createOpp = useMutation({
    mutationFn: async (payload: OpportunityPayload) => {
      const { data } = await apiClient.post<Opportunity>('/opps', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPS_KEY });
      toast.success('Oportunidade criada.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateOpp = useMutation({
    mutationFn: async ({ id, ...payload }: OpportunityPayload & { id: string }) => {
      const { data } = await apiClient.put<Opportunity>(`/opps/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPS_KEY });
      toast.success('Oportunidade atualizada.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteOpp = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/opps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPS_KEY });
      toast.success('Oportunidade removida.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const moveOpp = useMutation({
    mutationFn: async ({ id, stage, position }: { id: string; stage: OpportunityStage; position: number }) => {
      const { data } = await apiClient.put<Opportunity>(`/opps/${id}/move`, { stage, position });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPS_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    opportunities: oppsQuery.data ?? [],
    isLoading: oppsQuery.isLoading,
    isError: oppsQuery.isError,
    createOpportunity: createOpp.mutateAsync,
    creating: createOpp.isPending,
    updateOpportunity: updateOpp.mutateAsync,
    updating: updateOpp.isPending,
    deleteOpportunity: deleteOpp.mutateAsync,
    deleting: deleteOpp.isPending,
    moveOpportunity: moveOpp.mutateAsync,
    moving: moveOpp.isPending,
  };
}

export const opportunityStageLabels: Record<OpportunityStage, string> = {
  NEGOCIACAO: 'Negociação',
  APRESENTACAO: 'Apresentação',
  PROPOSTA: 'Proposta',
  TRIAL: 'Trial',
  VENC_TRIAL: 'Vencimento Trial',
  VENDAS: 'Vendas',
};

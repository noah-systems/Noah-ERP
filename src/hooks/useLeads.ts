import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient, getErrorMessage } from '@/services/api';
import type { Lead, LeadStage } from '@/types/domain';

export interface LeadPayload {
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  segment?: string;
  employees?: number;
  origin?: string;
  notes?: string;
  stage?: LeadStage;
}

const LEADS_KEY = ['leads'];

export function useLeads() {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: LEADS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<Lead[]>('/leads');
      return data;
    },
  });

  const createLead = useMutation({
    mutationFn: async (payload: LeadPayload) => {
      const { data } = await apiClient.post<Lead>('/leads', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead criado com sucesso.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...payload }: LeadPayload & { id: string }) => {
      const { data } = await apiClient.put<Lead>(`/leads/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead atualizado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead removido.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const moveLead = useMutation({
    mutationFn: async ({ id, stage, position }: { id: string; stage: LeadStage; position: number }) => {
      const { data } = await apiClient.put<Lead>(`/leads/${id}/move`, { stage, position });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    leads: leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    isError: leadsQuery.isError,
    refetch: leadsQuery.refetch,
    createLead: createLead.mutateAsync,
    creating: createLead.isPending,
    updateLead: updateLead.mutateAsync,
    updating: updateLead.isPending,
    deleteLead: deleteLead.mutateAsync,
    deleting: deleteLead.isPending,
    moveLead: moveLead.mutateAsync,
    moving: moveLead.isPending,
  };
}

export const leadStageLabels: Record<LeadStage, string> = {
  NUTRICAO: 'Nutrição',
  QUALIFICADO: 'Qualificado',
  NAO_QUALIFICADO: 'Não Qualificado',
};

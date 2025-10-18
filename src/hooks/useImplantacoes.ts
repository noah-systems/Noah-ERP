import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient, getErrorMessage } from '@/services/api';
import type { Implementation, ImplementationStatus } from '@/types/domain';

const IMPLEMENTATIONS_KEY = ['implementations'];

export interface ImplementationCreatePayload {
  opportunityId: string;
  scheduledFor: string;
  notes?: string;
}

export interface ImplementationUpdatePayload {
  id: string;
  scheduledFor?: string;
  status?: ImplementationStatus;
  notes?: string;
  completedAt?: string | null;
}

export function useImplantacoes() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: IMPLEMENTATIONS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<Implementation[]>('/implants');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: ImplementationCreatePayload) => {
      const { data } = await apiClient.post<Implementation>('/implants', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IMPLEMENTATIONS_KEY });
      toast.success('Implantação agendada.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: ImplementationUpdatePayload) => {
      const { data } = await apiClient.put<Implementation>(`/implants/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IMPLEMENTATIONS_KEY });
      toast.success('Implantação atualizada.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    implementations: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createImplementation: createMutation.mutateAsync,
    creating: createMutation.isPending,
    updateImplementation: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  };
}

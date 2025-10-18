import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient, getErrorMessage } from '@/services/api';
import type { Cancellation } from '@/types/domain';

const CANCELLATIONS_KEY = ['cancellations'];

export interface CancellationPayload {
  leadId?: string;
  opportunityId?: string;
  reason: string;
  details?: string;
  cancelledAt?: string;
}

export function useCancellations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CANCELLATIONS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<Cancellation[]>('/cancellations');
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (payload: CancellationPayload) => {
      const { data } = await apiClient.post<Cancellation>('/cancellations', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANCELLATIONS_KEY });
      toast.success('Cancelamento registrado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    cancellations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createCancellation: create.mutateAsync,
    creating: create.isPending,
  };
}

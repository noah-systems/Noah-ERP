import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { OpportunityPayload, OpportunityStage } from '@/types/api';
import { opportunityStageLabels } from '@/hooks/useOpportunities';

type LeadOption = {
  id: string;
  label: string;
};

interface CreateOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: OpportunityPayload) => Promise<unknown> | unknown;
  leads: LeadOption[];
}

type OpportunityFormValues = {
  title: string;
  leadId: string;
  value?: number;
  stage: OpportunityStage;
  expectedClose?: string;
};

const stageOrder: OpportunityStage[] = [
  'NEGOCIACAO',
  'APRESENTACAO',
  'PROPOSTA',
  'TRIAL',
  'VENC_TRIAL',
  'VENDAS',
];

const stageOptions: Array<{ value: OpportunityStage; label: string }> = stageOrder.map((value) => ({
  value,
  label: opportunityStageLabels[value],
}));

const defaultValues: OpportunityFormValues = {
  title: '',
  leadId: '',
  value: undefined,
  stage: 'NEGOCIACAO',
  expectedClose: '',
};

export function CreateOpportunityModal({ open, onClose, onSubmit, leads }: CreateOpportunityModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<OpportunityFormValues>({
    defaultValues,
  });

  const selectedLeadId = watch('leadId');
  const selectedStage = watch('stage');

  useEffect(() => {
    if (!open) {
      reset({ ...defaultValues });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values.title.trim(),
      leadId: values.leadId,
      stage: values.stage,
      value: Number.isFinite(values.value) ? values.value : undefined,
      expectedClose: values.expectedClose?.trim() || undefined,
    });
    reset({ ...defaultValues });
  });

  const leadIdRegister = register('leadId', { required: true });
  const stageRegister = register('stage', { required: true });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Oportunidade</DialogTitle>
        </DialogHeader>

        <form className="grid grid-cols-2 gap-4" onSubmit={submit}>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="opportunity-title">Título *</Label>
            <Input
              id="opportunity-title"
              placeholder="Descreva a oportunidade"
              {...register('title', { required: true })}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="opportunity-lead">Lead *</Label>
            <input type="hidden" value={selectedLeadId ?? ''} {...leadIdRegister} />
            <Select
              value={selectedLeadId ?? undefined}
              onValueChange={(value) => {
                setValue('leadId', value, { shouldValidate: true, shouldDirty: true });
              }}
            >
              <SelectTrigger id="opportunity-lead" disabled={leads.length === 0}>
                <SelectValue placeholder="Selecione um lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.length === 0 ? (
                  <SelectItem value="" disabled>
                    Nenhum lead disponível
                  </SelectItem>
                ) : (
                  leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunity-value">Valor estimado (R$)</Label>
            <Input
              id="opportunity-value"
              type="number"
              step="0.01"
              min={0}
              {...register('value', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunity-expected-close">Previsão de fechamento</Label>
            <Input id="opportunity-expected-close" type="date" {...register('expectedClose')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunity-stage">Etapa inicial</Label>
            <input type="hidden" value={selectedStage} {...stageRegister} />
            <Select
              value={selectedStage ?? undefined}
              onValueChange={(value) => {
                setValue('stage', value as OpportunityStage, { shouldValidate: true, shouldDirty: true });
              }}
            >
              <SelectTrigger id="opportunity-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="col-span-2 mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || leads.length === 0}>
              {isSubmitting ? 'Salvando…' : 'Criar oportunidade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

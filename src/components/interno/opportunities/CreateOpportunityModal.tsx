import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { OpportunityPayload } from '@/hooks/useOpportunities';

interface CreateOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: OpportunityPayload) => Promise<void> | void;
  submitting?: boolean;
}

interface OpportunityFormValues {
  name: string;
  value?: number;
  contactName?: string;
  stage: OpportunityPayload['stage'];
  modules: string;
  trialEndsAt?: string;
  workspaceSlug?: string;
}

export function CreateOpportunityModal({ open, onClose, onSubmit, submitting }: CreateOpportunityModalProps) {
  const { register, control, handleSubmit, reset } = useForm<OpportunityFormValues>({
    defaultValues: {
      stage: 'NEGOCIACAO',
      modules: '',
    },
  });

  useEffect(() => {
    if (!open) {
      reset({ stage: 'NEGOCIACAO', modules: '' });
    }
  }, [open, reset]);

  const onSubmitForm = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      value: values.value ?? null,
      contactName: values.contactName || undefined,
      stage: values.stage,
      modules: values.modules
        .split(',')
        .map((module) => module.trim())
        .filter(Boolean),
      trialEndsAt: values.trialEndsAt || undefined,
      workspaceSlug: values.workspaceSlug || undefined,
    });
    reset({ stage: values.stage, modules: '' });
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Oportunidade</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmitForm} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="name">
              Nome da Oportunidade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Distribuidora XYZ - CRM"
              {...register('name', { required: true })}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contato</Label>
            <Input
              id="contactName"
              placeholder="Nome do contato principal"
              {...register('contactName')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register('value', { valueAsNumber: true })}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Etapa Inicial</Label>
            <Controller
              name="stage"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={submitting}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEGOCIACAO">Negociação</SelectItem>
                    <SelectItem value="APRESENTACAO">Apresentação</SelectItem>
                    <SelectItem value="PROPOSTA">Proposta</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="VENC_TRIAL">Vencimento Trial</SelectItem>
                    <SelectItem value="VENDAS">Vendas</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modules">Módulos (separados por vírgula)</Label>
            <Input
              id="modules"
              placeholder="CRM, WhatsApp, VOIP"
              {...register('modules')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trialEndsAt">Fim do Trial</Label>
            <Input id="trialEndsAt" type="date" {...register('trialEndsAt')} disabled={submitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspaceSlug">Subdomínio</Label>
            <Input
              id="workspaceSlug"
              placeholder="empresa"
              {...register('workspaceSlug')}
              disabled={submitting}
            />
          </div>

          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Criar Oportunidade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

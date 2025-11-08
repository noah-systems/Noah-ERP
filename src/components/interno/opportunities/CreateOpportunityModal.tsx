import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { opportunityStageLabels, OPPORTUNITY_STAGE_ORDER } from '@/hooks/useOpportunities';
import type { CreateOpportunityPayload, OpportunityStage } from '@/types/api';

interface CreateOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOpportunityPayload) => Promise<unknown> | unknown;
}

type FormValues = {
  companyName: string;
  cnpj?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  financeEmail?: string;
  financePhone?: string;
  ownerId: string;
  stage: OpportunityStage;
  amount: number;
  subdomain?: string;
  trialEndsAt?: string;
  tags?: string;
};

const stageOptions = OPPORTUNITY_STAGE_ORDER.map((stage) => ({
  value: stage,
  label: opportunityStageLabels[stage],
}));

const defaultValues: FormValues = {
  companyName: '',
  cnpj: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  financeEmail: '',
  financePhone: '',
  ownerId: '',
  stage: 'NEGOTIATION',
  amount: 0,
  subdomain: '',
  trialEndsAt: '',
  tags: '',
};

function parseTags(raw?: string): string[] | undefined {
  if (!raw) return undefined;
  const tags = raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
}

export function CreateOpportunityModal({ open, onClose, onSubmit }: CreateOpportunityModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues });

  const selectedStage = watch('stage');

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    const payload: CreateOpportunityPayload = {
      companyName: values.companyName.trim(),
      cnpj: values.cnpj?.trim() || undefined,
      contactName: values.contactName.trim(),
      contactEmail: values.contactEmail?.trim() || undefined,
      contactPhone: values.contactPhone?.trim() || undefined,
      financeEmail: values.financeEmail?.trim() || undefined,
      financePhone: values.financePhone?.trim() || undefined,
      ownerId: values.ownerId.trim(),
      stage: values.stage,
      amount: Number.isFinite(values.amount) ? Number(values.amount) : 0,
      subdomain: values.subdomain?.trim() || undefined,
      trialEndsAt: values.trialEndsAt || undefined,
      tags: parseTags(values.tags),
    };
    await onSubmit(payload);
    reset(defaultValues);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Oportunidade</DialogTitle>
        </DialogHeader>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="companyName">Razão Social *</Label>
            <Input id="companyName" placeholder="Nome da empresa" {...register('companyName', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0000-00" {...register('cnpj')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerId">Responsável (Owner) *</Label>
            <Input id="ownerId" placeholder="ID do responsável" {...register('ownerId', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Nome do Contato *</Label>
            <Input id="contactName" placeholder="Nome completo" {...register('contactName', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">E-mail do Contato</Label>
            <Input id="contactEmail" type="email" placeholder="contato@empresa.com" {...register('contactEmail')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefone do Contato</Label>
            <Input id="contactPhone" placeholder="(00) 00000-0000" {...register('contactPhone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="financeEmail">E-mail Financeiro</Label>
            <Input id="financeEmail" type="email" placeholder="financeiro@empresa.com" {...register('financeEmail')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="financePhone">Telefone Financeiro</Label>
            <Input id="financePhone" placeholder="(00) 00000-0000" {...register('financePhone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">URL / Subdomínio</Label>
            <Input id="subdomain" placeholder="ex: cliente" {...register('subdomain')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Oportunidade (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={0}
              placeholder="0,00"
              {...register('amount', { required: true, valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Etapa Inicial</Label>
            <Select
              value={selectedStage}
              onValueChange={(value) => setValue('stage', value as OpportunityStage, { shouldDirty: true })}
            >
              <SelectTrigger id="stage">
                <SelectValue placeholder="Selecione" />
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

          <div className="space-y-2">
            <Label htmlFor="trialEndsAt">Trial termina em</Label>
            <Input id="trialEndsAt" type="date" {...register('trialEndsAt')} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Textarea id="tags" placeholder="CRM, WhatsApp, VOIP" rows={2} {...register('tags')} />
          </div>

          <DialogFooter className="md:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Criar oportunidade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

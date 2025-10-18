import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import type { LeadPayload, LeadStage } from '@/types/api';

type CreateLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: LeadPayload) => Promise<unknown> | unknown;
};

type LeadFormValues = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
  stage: LeadStage;
  value?: number;
};

const stageOptions: Array<{ value: LeadStage; label: string }> = [
  { value: 'NUTRICAO', label: 'Nutrição' },
  { value: 'QUALIFICADO', label: 'Qualificado' },
  { value: 'NAO_QUALIFICADO', label: 'Não Qualificado' },
];

export function CreateLeadModal({ open, onClose, onSubmit }: CreateLeadModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<LeadFormValues>({
    defaultValues: {
      stage: 'NUTRICAO',
    },
  });

  useEffect(() => {
    if (!open) {
      reset({ stage: 'NUTRICAO' });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      company: values.company?.trim() || undefined,
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      source: values.source?.trim() || undefined,
      stage: values.stage,
      value: values.value ? Number(values.value) : undefined,
    });
    reset({ stage: 'NUTRICAO' });
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
        </DialogHeader>

        <form className="grid grid-cols-2 gap-4" onSubmit={submit}>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="lead-name">Nome do contato *</Label>
            <Input
              id="lead-name"
              placeholder="Nome completo"
              {...register('name', { required: true })}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="lead-company">Empresa</Label>
            <Input id="lead-company" placeholder="Razão social" {...register('company')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-email">E-mail</Label>
            <Input id="lead-email" type="email" placeholder="contato@empresa.com" {...register('email')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-phone">Telefone</Label>
            <Input id="lead-phone" placeholder="(00) 00000-0000" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-source">Origem</Label>
            <Input id="lead-source" placeholder="Inbound, Evento..." {...register('source')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-value">Valor estimado (R$)</Label>
            <Input id="lead-value" type="number" step="0.01" min={0} {...register('value', { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label>Estágio</Label>
            <Select
              defaultValue="NUTRICAO"
              onValueChange={(value) => {
                setValue('stage', value as LeadStage);
              }}
            >
              <SelectTrigger>
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

          <div className="col-span-2 space-y-2">
            <Label htmlFor="lead-notes">Observações</Label>
            <Textarea
              id="lead-notes"
              rows={3}
              placeholder="Informações relevantes, objeções, contexto"
              {...register('notes')}
            />
          </div>

          <DialogFooter className="col-span-2 mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Criar lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

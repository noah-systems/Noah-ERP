import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import type { LeadPayload } from '@/hooks/useLeads';

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: LeadPayload) => Promise<void> | void;
  submitting?: boolean;
}

type LeadFormValues = {
  companyName: string;
  segment?: string;
  employees?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  origin?: string;
  notes?: string;
  stage: LeadPayload['stage'];
};

const SEGMENTS = ['Varejo', 'Tecnologia', 'Distribuição', 'Serviços', 'Indústria'];
const ORIGINS = ['Google Ads', 'Meta', 'Manual'];

export function CreateLeadModal({ open, onClose, onSubmit, submitting }: CreateLeadModalProps) {
  const { control, register, handleSubmit, reset } = useForm<LeadFormValues>({
    defaultValues: {
      stage: 'NUTRICAO',
    },
  });

  useEffect(() => {
    if (!open) {
      reset({ stage: 'NUTRICAO' });
    }
  }, [open, reset]);

  const onSubmitForm = handleSubmit(async (values) => {
    await onSubmit({
      companyName: values.companyName,
      segment: values.segment || undefined,
      employees: values.employees || undefined,
      contactName: values.contactName || undefined,
      contactPhone: values.contactPhone || undefined,
      contactEmail: values.contactEmail || undefined,
      origin: values.origin || undefined,
      notes: values.notes || undefined,
      stage: values.stage,
    });
    reset({ stage: values.stage });
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmitForm} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">
              Nome da Empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              placeholder="Ex: Empresa ABC Ltda"
              {...register('companyName', { required: true })}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Controller
              control={control}
              name="segment"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={submitting}
                >
                  <SelectTrigger id="segment">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEGMENTS.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employees">Qtd. de Funcionários</Label>
            <Input
              id="employees"
              type="number"
              placeholder="Ex: 50"
              {...register('employees', { valueAsNumber: true })}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Nome do Contato</Label>
            <Input
              id="contactName"
              placeholder="Ex: João Silva"
              {...register('contactName')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              {...register('contactPhone')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              {...register('contactEmail')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin">Origem</Label>
            <Controller
              control={control}
              name="origin"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={submitting}
                >
                  <SelectTrigger id="origin">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGINS.map((origin) => (
                      <SelectItem key={origin} value={origin}>
                        {origin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Etapa inicial</Label>
            <Controller
              control={control}
              name="stage"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={submitting}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUTRICAO">Nutrição</SelectItem>
                    <SelectItem value="QUALIFICADO">Qualificado</SelectItem>
                    <SelectItem value="NAO_QUALIFICADO">Não Qualificado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionais sobre o lead..."
              rows={3}
              {...register('notes')}
              disabled={submitting}
            />
          </div>

          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Criar Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

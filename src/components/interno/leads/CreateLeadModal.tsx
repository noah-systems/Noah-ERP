import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import type { LeadPayload } from '@/types/api';

const SOURCE_OPTIONS = ['Inbound', 'Manual', 'Evento', 'Parceria', 'Indicação'];

type CreateLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: LeadPayload) => Promise<unknown> | unknown;
  defaultOwnerId?: string;
};

type LeadFormValues = {
  companyName: string;
  segment?: string;
  employeesCount?: number;
  contactName?: string;
  phone?: string;
  email?: string;
  source?: string;
  ownerId?: string;
  notes?: string;
};

export function CreateLeadModal({ open, onClose, onSubmit, defaultOwnerId }: CreateLeadModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<LeadFormValues>({
    defaultValues: {
      ownerId: defaultOwnerId,
    },
  });

  const sourceValue = watch('source');

  useEffect(() => {
    if (open) {
      reset({ ownerId: defaultOwnerId });
    }
  }, [open, defaultOwnerId, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      companyName: values.companyName.trim(),
      segment: values.segment?.trim() || undefined,
      employeesCount: values.employeesCount ? Number(values.employeesCount) : undefined,
      contactName: values.contactName?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      email: values.email?.trim() || undefined,
      source: values.source?.trim() || undefined,
      ownerId: values.ownerId?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
    reset({ ownerId: defaultOwnerId });
  });

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar novo lead</DialogTitle>
        </DialogHeader>

        <form className="grid grid-cols-2 gap-4" onSubmit={submit}>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="lead-company">Nome da empresa *</Label>
            <Input
              id="lead-company"
              placeholder="Ex.: Empresa ABC Ltda"
              {...register('companyName', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-segment">Segmento</Label>
            <Input id="lead-segment" placeholder="Tecnologia, Serviços..." {...register('segment')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-employees">Qtd. de funcionários</Label>
            <Input
              id="lead-employees"
              type="number"
              min={0}
              step={1}
              {...register('employeesCount', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-contact">Nome do contato</Label>
            <Input id="lead-contact" placeholder="Nome e sobrenome" {...register('contactName')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-phone">Telefone</Label>
            <Input id="lead-phone" placeholder="(00) 00000-0000" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-email">E-mail</Label>
            <Input id="lead-email" type="email" placeholder="contato@empresa.com" {...register('email')} />
          </div>

          <div className="space-y-2">
            <Label>Origem</Label>
            <input type="hidden" {...register('source')} />
            <Select
              value={(sourceValue ?? undefined) as string | undefined}
              onValueChange={(value) => setValue('source', value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-owner">Responsável</Label>
            <Input id="lead-owner" placeholder="ID do responsável" {...register('ownerId')} />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="lead-notes">Observações</Label>
            <Textarea
              id="lead-notes"
              rows={4}
              placeholder="Adicione observações importantes sobre o lead"
              {...register('notes')}
            />
          </div>

          <DialogFooter className="col-span-2 mt-4">
            <div className="flex w-full justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando…' : 'Criar lead'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';

interface MarkOpportunityLostDialogProps {
  open: boolean;
  opportunityName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

export function MarkOpportunityLostDialog({
  open,
  opportunityName,
  loading = false,
  onClose,
  onConfirm,
}: MarkOpportunityLostDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Marcar oportunidade como perdida</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Confirme a perda de {opportunityName ? <strong>{opportunityName}</strong> : 'esta oportunidade'}. Opcionalmente,
            registre o motivo para manter o histórico atualizado.
          </p>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Informe o motivo (opcional)"
            rows={4}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
          >
            {loading ? 'Enviando…' : 'Marcar como perdida'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface CreateOpportunityModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOpportunityModal({ open, onClose }: CreateOpportunityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Oportunidade</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="company">
              Razão Social <span className="text-red-500">*</span>
            </Label>
            <Input id="company" placeholder="Nome da empresa" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0000-00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">
              Nome do Contato <span className="text-red-500">*</span>
            </Label>
            <Input id="contactName" placeholder="Nome completo" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              E-mail Contato <span className="text-red-500">*</span>
            </Label>
            <Input id="email" type="email" placeholder="contato@empresa.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone Contato</Label>
            <Input id="phone" placeholder="(00) 00000-0000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailFinancial">E-mail Financeiro</Label>
            <Input id="emailFinancial" type="email" placeholder="financeiro@empresa.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneFinancial">Telefone Financeiro</Label>
            <Input id="phoneFinancial" placeholder="(00) 00000-0000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Responsável (Owner)</Label>
            <Select>
              <SelectTrigger id="owner">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maria">Maria Santos</SelectItem>
                <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                <SelectItem value="joana">Joana Pereira</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Etapa Inicial</Label>
            <Select defaultValue="negociacao">
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negociacao">Negociação</SelectItem>
                <SelectItem value="apresentacao">Apresentação Agendada</SelectItem>
                <SelectItem value="proposta">Proposta Enviada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Criar Oportunidade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

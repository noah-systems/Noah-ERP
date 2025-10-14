import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateLeadModal({ open, onClose }: CreateLeadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">
              Nome da Empresa <span className="text-red-500">*</span>
            </Label>
            <Input id="company" placeholder="Ex: Empresa ABC Ltda" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">
              Segmento <span className="text-red-500">*</span>
            </Label>
            <Select>
              <SelectTrigger id="segment">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="distribuicao">Distribuição</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="industria">Indústria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employees">Qtd. de Funcionários</Label>
            <Input id="employees" type="number" placeholder="Ex: 50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">
              Nome do Contato <span className="text-red-500">*</span>
            </Label>
            <Input id="contactName" placeholder="Ex: João Silva" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefone <span className="text-red-500">*</span>
            </Label>
            <Input id="phone" placeholder="(00) 00000-0000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              E-mail <span className="text-red-500">*</span>
            </Label>
            <Input id="email" type="email" placeholder="contato@empresa.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin">Origem</Label>
            <Select>
              <SelectTrigger id="origin">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="meta">Meta</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" placeholder="Notas adicionais sobre o lead..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Criar Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

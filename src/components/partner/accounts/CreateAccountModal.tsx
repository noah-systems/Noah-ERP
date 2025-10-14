import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Lock } from 'lucide-react';

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAccountModal({ open, onClose }: CreateAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">
                Razão Social <span className="text-red-500">*</span>
              </Label>
              <Input id="razaoSocial" placeholder="Nome da empresa" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <Input id="email" type="email" placeholder="contato@empresa.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="(00) 00000-0000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">
              URL Subdomínio <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input 
                id="subdomain" 
                placeholder="nomedaempresa" 
                className="flex-1"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">.noahomni.com.br</span>
            </div>
            <p className="text-xs text-gray-500">
              O subdomínio deve conter apenas letras minúsculas, números e hífens
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="users">
                Qtd. Usuários <span className="text-red-500">*</span>
              </Label>
              <Input id="users" type="number" defaultValue="10" min="1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" type="number" defaultValue="0" min="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" type="number" defaultValue="0" min="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" type="number" defaultValue="0" min="0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waba">WABA</Label>
            <Input id="waba" type="number" defaultValue="0" min="0" />
          </div>

          <div className="space-y-3">
            <Label>Módulos</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="mod-campanha" />
                <label htmlFor="mod-campanha" className="text-sm">Campanha</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="mod-crm" defaultChecked />
                <label htmlFor="mod-crm" className="text-sm">CRM</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="mod-voip" />
                <label htmlFor="mod-voip" className="text-sm">VOIP</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="mod-glpi" />
                <label htmlFor="mod-glpi" className="text-sm">GLPI</label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Campos visíveis apenas para Admin Noah / Suporte Noah</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hosting">Hospedagem (Fornecedor)</Label>
                <Input id="hosting" disabled placeholder="Selecione o fornecedor" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip">IP do Servidor</Label>
                <Input id="ip" disabled placeholder="000.000.000.000" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activationDate">Data Ativação</Label>
              <Input id="activationDate" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancelDate">Data Cancelamento</Label>
              <Input id="cancelDate" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingDay">Dia Base Cobrança</Label>
              <Input id="billingDay" type="number" min="1" max="31" placeholder="1-31" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Criar Conta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

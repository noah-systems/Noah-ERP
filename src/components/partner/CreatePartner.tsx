import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Trash } from 'lucide-react';
import { Separator } from '../ui/separator';

export function CreatePartner() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">Criar Novo Parceiro</h1>
        <p className="text-gray-500">Configure um novo parceiro white label</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Parceiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">
                Razão Social <span className="text-red-500">*</span>
              </Label>
              <Input id="razaoSocial" placeholder="Nome completo da empresa" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">
                CNPJ <span className="text-red-500">*</span>
              </Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apelido">
                Apelido (Exibido no Sistema) <span className="text-red-500">*</span>
              </Label>
              <Input id="apelido" placeholder="Nome curto para exibição" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dominio">
                Domínio <span className="text-red-500">*</span>
              </Label>
              <Input id="dominio" placeholder="parceiro.com.br" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Input id="endereco" placeholder="Rua, número, bairro, cidade, estado, CEP" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Input id="responsavel" placeholder="Nome do responsável" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input id="whatsapp" placeholder="(00) 00000-0000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailFinanceiro">
                E-mail Financeiro <span className="text-red-500">*</span>
              </Label>
              <Input id="emailFinanceiro" type="email" placeholder="financeiro@parceiro.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailComunicados">
                E-mail Comunicados <span className="text-red-500">*</span>
              </Label>
              <Input id="emailComunicados" type="email" placeholder="contato@parceiro.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela de Valores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded text-sm">
              <div>Item</div>
              <div>Preço Base (R$)</div>
              <div>Preço Parceiro (R$)</div>
              <div>Margem (%)</div>
            </div>
            
            {['Usuário', 'WhatsApp', 'Instagram', 'Facebook', 'WABA', 'Módulo CRM', 'Módulo Campanha', 'Módulo VOIP'].map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-3 items-center">
                <div className="text-sm">{item}</div>
                <Input type="number" placeholder="0.00" />
                <Input type="number" placeholder="0.00" />
                <Input type="number" placeholder="0" disabled className="bg-gray-50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Criação de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm text-blue-900 mb-3">Usuário Financeiro</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userFinName">Nome Completo</Label>
                <Input id="userFinName" placeholder="Nome do usuário financeiro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userFinEmail">E-mail</Label>
                <Input id="userFinEmail" type="email" placeholder="usuario@parceiro.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userFinPassword">Senha</Label>
                <Input id="userFinPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userFinPhone">Telefone</Label>
                <Input id="userFinPhone" placeholder="(00) 00000-0000" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="text-sm text-purple-900 mb-3">Usuário Operações</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userOpName">Nome Completo</Label>
                <Input id="userOpName" placeholder="Nome do usuário operações" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userOpEmail">E-mail</Label>
                <Input id="userOpEmail" type="email" placeholder="usuario@parceiro.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userOpPassword">Senha</Label>
                <Input id="userOpPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userOpPhone">Telefone</Label>
                <Input id="userOpPhone" placeholder="(00) 00000-0000" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prévia da Marca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400">Logo</span>
            </div>
            <p className="text-gray-900">Apelido do Parceiro</p>
            <p className="text-sm text-gray-500">parceiro.com.br</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Criar Parceiro</Button>
      </div>
    </div>
  );
}

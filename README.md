# Noah ERP

ERP da Noah Omni com frontend em Vite/React e API em NestJS/Prisma.

## Requisitos de Sistema

Para um deploy manual completo (sem Docker) recomenda-se garantir os seguintes componentes instalados e atualizados:

- PHP 8.1 com os módulos `fpm`, `mysql`, `xml`, `curl`, `zip`, `gd`, `mbstring` e `bcmath`.
- MySQL 8.0+ (ou compatível) com acesso local para o usuário da aplicação.
- Node.js 18 ou superior (o projeto utiliza funcionalidades recentes do Node e recomenda-se a versão 20+).
- Nginx ou outro servidor web compatível com PHP-FPM.
- Redis 6+ em execução local para filas (opcional, porém recomendado).

## Instalação Manual

1. **Provisionamento automático (opcional):** execute o script [`install.sh`](./install.sh) como `root` em uma máquina recém-provisionada para instalar dependências do sistema, clonar o repositório e configurar a aplicação.
2. **Instalação guiada:** siga o guia detalhado em [`deploy-manual.md`](./deploy-manual.md) para replicar os passos manualmente, incluindo a execução de [`database-setup.sql`](./database-setup.sql).
3. **Configurar ambiente:** copie `.env.example` para `.env`, ajuste credenciais (`DATABASE_URL`, `JWT_SECRET`, dados do administrador e URLs) e confirme que `REDIS_HOST` ou `REDIS_URL` apontam para `127.0.0.1`.
4. **Dependências do projeto:**
   ```bash
   npm ci
   npm run prisma:generate
   npm run prisma:migrate
   ```
   Execute `node prisma/seed.js` caso deseje criar o usuário administrador padrão.
5. **Build de produção:**
   ```bash
   npm run build:web
   npm run build:api
   ```
6. **Serviços de backend:** inicie a API compilada (ex.: `pm2 start npm --name noah-api -- run start:api`), configure o worker de filas (BullMQ/Redis) e habilite o cron do agendador conforme descrito no guia de deploy.
7. **Servidor web:** sirva o diretório `dist/` com Nginx apontando `/api` para a API Node ou utilize o template de virtual host presente no script `install.sh`.

## Uso do Docker (opcional)

O projeto foi ajustado para funcionar integralmente em ambientes tradicionais LEMP. Caso prefira executar com Docker, utilize sua stack/containerização de preferência configurando manualmente os serviços de banco de dados, Redis e Node.js. A equipe mantém o foco no deploy bare-metal, portanto valide seus manifests antes de utilizar em produção.

## Verificação

Para validar rapidamente a instalação, utilize o smoke test Playwright (exige API, banco e Redis funcionando):

```bash
npm run qa:smoke
```

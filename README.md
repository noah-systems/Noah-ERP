# Noah ERP

ERP da Noah Omni com frontend em Vite/React e API em NestJS/Prisma.

## Requisitos de Sistema

Para um deploy manual completo (sem Docker) recomenda-se garantir os seguintes componentes instalados e atualizados:

- Node.js 20 ou superior.
- PostgreSQL 15 ou superior com acesso local para o usuário da aplicação.
- Redis 6+ em execução local para filas (opcional, porém recomendado).
- Servidor HTTP (Nginx, Caddy, etc.) para servir o frontend compilado e atuar como reverse proxy para a API.

## Instalação Manual

1. **Provisionamento opcional:** utilize o script [`install.sh`](./install.sh) apenas como referência histórica. Ele cobre o stack legado em PHP e não deve ser executado em ambientes novos.
2. **Instalação guiada:** siga o guia detalhado em [`deploy-manual.md`](./deploy-manual.md) para provisionar banco de dados PostgreSQL, Redis e serviços Node.
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
6. **Serviços de backend:** inicie a API compilada (ex.: `pm2 start npm --name noah-api -- run start:api`), configure o worker de filas (BullMQ/Redis) e habilite os cron jobs necessários.
7. **Servidor web:** sirva o diretório `dist/` com Nginx (ou outro servidor de sua preferência) e encaminhe `/api` para a API Node.

## Uso do Docker (opcional)

O projeto foi ajustado para funcionar integralmente em ambientes tradicionais LEMP. Caso prefira executar com Docker, utilize sua stack/containerização de preferência configurando manualmente os serviços de banco de dados, Redis e Node.js. A equipe mantém o foco no deploy bare-metal, portanto valide seus manifests antes de utilizar em produção.

## Verificação

Para validar rapidamente a instalação, utilize o smoke test Playwright (exige API, banco e Redis funcionando):

```bash
npm run qa:smoke
```

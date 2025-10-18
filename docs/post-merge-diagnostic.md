# Diagnóstico pós-merge (produção Noah ERP)

Este roteiro documenta o estado esperado do ambiente de produção após um merge na branch principal e serve como checklist rápido para confirmar que API, banco e front continuam saudáveis.

## Backend / API

- **Processo**: `systemd` mantém a API escutando na porta `3000`, com o Nginx publicando em `https://erpapi.noahomni.com.br/api`.
- **Health check**: `GET https://erpapi.noahomni.com.br/ping` precisa responder `200 {"ok": true}`.
- **CORS / preflight**: requisições `OPTIONS` para `/api/auth/login` (e equivalentes) retornam `204` com os cabeçalhos `Access-Control-Allow-*` completos.
- **ACL**: rotas protegidas devem devolver `401` sem header `Authorization: Bearer`. O mesmo endpoint precisa responder `200` quando receber um token válido.
- **Rotas principais** (mínimo obrigatório conforme build atual):
  - `POST /api/auth/login`, `GET /api/auth/me`.
  - `GET`/`POST /api/leads`, `POST /api/leads/:id/move`, `DELETE /api/leads/:id`.
  - `GET`/`POST /api/opps`, `POST /api/opps/:id/move`, `DELETE /api/opps/:id`.
- **Prisma**: client já gerado; não há migrações pendentes e o Postgres (`127.0.0.1:5432`) responde.
- **Redis/Valkey**: porta `6379` ativa para sessões e rate limiting (quando habilitado).
- **Seed obrigatório**: sem o usuário administrador seedado, o login falha com `401`. Garanta que `npm --prefix api run seed` foi executado (sobrescreva credenciais com `SEED_ADMIN_*` se necessário), ou insira o admin diretamente no banco.

## Banco de dados

- **Conexão**: `DATABASE_URL=postgresql://noah...@127.0.0.1:5432/noah?schema=public` está funcional.
- **Prisma seed formal**: mantenha o bloco a seguir em `api/package.json` para que `npm --prefix api run seed` execute `prisma/seed.js`.

  ```json
  {
    "prisma": {
      "seed": "node prisma/seed.js"
    }
  }
  ```

  Isso evita esquecimento do administrador durante reinstalações.

## Front / branding / UX

- **Build**: a build do Vite fica na raiz do repo. Publique o conteúdo de `dist/` como docroot em `erp.noahomni.com.br`.
- **Variáveis**: `.env.production` precisa apontar para a API e assets de branding:

  ```dotenv
  VITE_API_BASE=https://erpapi.noahomni.com.br/api
  VITE_LOGO_LIGHT=/brand/logo-light.png
  VITE_LOGO_DARK=/brand/logo-dark.png
  VITE_LOGIN_BG=/brand/login-eclipse-desktop.png
  VITE_LOGIN_BG_PORTRAIT=/brand/login-eclipse-mobile.png
  VITE_THEME_COLOR=#<cor-da-marca>
  ```

- **Assets**: garanta que os PNGs em `public/brand/` estejam publicados no mesmo host do front (não depende de S3). O código tem fallback local, então caminhos quebrados resultam em ícones ausentes.
- **UX mínimo**:
  - Placeholder em tema escuro com contraste ≥ 4.5:1.
  - Estado de erro visual nos inputs (borda/label).
  - Botão "Entrar" com cursor e indicador de loading.
  - Favicon e manifest disponíveis.

## Checklist rápido para 100% funcional

1. Seed de administrador criado (manual ou via `prisma/seed.js`).
2. Front build publicado em `dist/` na raiz.
3. Nginx configurado com:
   - `erp` servindo `root /var/www/erp/dist;`
   - `erpapi` com `location /api/ { proxy_pass http://127.0.0.1:3000/; }` e CORS liberando `https://erp.noahomni.com.br`.
4. Variáveis de ambiente revisadas tanto na API quanto no front.
5. Execute `./scripts/noah_e2e_check.sh` (vide README) apontando para os hosts públicos. Com status `OK`, cadastros/movimentações de leads e oportunidades passam nos testes funcionais documentados em [`docs/QA.md`](./QA.md).

> Reavalie este diagnóstico sempre que novas rotas ou assets forem introduzidos para manter o checklist sincronizado com o estado atual da aplicação.

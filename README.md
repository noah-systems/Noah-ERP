# Noah ERP

Este monorepo reúne o front-end (Vite/React) e a API (NestJS + Prisma) do Noah ERP, com
empacotamento oficial para produção via Docker Compose, Nginx como reverse proxy e Certbot
para os certificados TLS dos domínios:

- **Frontend:** https://erp.noahomni.com.br
- **API:** https://erpapi.noahomni.com.br (todas as rotas expostas com prefixo `/api`)

A stack contempla Postgres, Redis, aplicação da API com migrations/seed automáticos e o
build estático do front hospedado no serviço `web` (Nginx).

## Estrutura do repositório

```
apps/api             # API NestJS + Prisma
apps/api/prisma      # schema, migrations e seed idempotente
src/                 # Front-end Vite/React
Dockerfile.web       # Build do front (Vite -> Nginx)
docker/compose.prod.yml
scripts/             # Scripts de automação (deploy, validação CI etc.)
```

O schema Prisma definitivo vive em `apps/api/prisma/schema.prisma`. As migrations ficam no
mesmo diretório e são aplicadas automaticamente quando o container da API inicia com
`PRISMA_MIGRATE_ON_START=1`.

## Pré-requisitos

- Docker 24+ e Docker Compose plugin.
- Node.js 20 LTS (para builds locais).
- Acesso DNS apontando os domínios `erp.noahomni.com.br` e `erpapi.noahomni.com.br` para o
  host que executará o deploy.

## Variáveis de ambiente

### API (`apps/api`)

| Variável            | Exemplo / padrão                               | Descrição |
| ------------------- | ---------------------------------------------- | --------- |
| `DATABASE_URL`      | `postgres://noah:noah@db:5432/noah`             | Conexão do Postgres consumida pelo Prisma. |
| `REDIS_URL`         | `redis://redis:6379`                            | URL do Redis utilizado pelos workers BullMQ. |
| `JWT_SECRET`        | _obrigatória_                                   | Chave utilizada para assinar os JWTs. Gere um valor forte. |
| `PORT`              | `3000`                                          | Porta exposta pela API. |
| `CORS_ORIGINS`      | `https://erp.noahomni.com.br,https://erpapi.noahomni.com.br` | Lista (separada por vírgula) de origens liberadas via CORS. |
| `ADMIN_NAME`        | `Admin Noah`                                    | Nome exibido para o usuário administrador padrão. |
| `ADMIN_EMAIL`       | `admin@noahomni.com.br`                         | E-mail do administrador padrão criado no seed. |
| `ADMIN_PASSWORD`    | `D2W3£Qx!0Du#`                                  | Senha do administrador padrão criada/atualizada no seed. |
| `PRISMA_MIGRATE_ON_START` | `1`                                       | Quando `1`, aplica `prisma migrate deploy` e executa o seed idempotente no boot. |

> **Importante:** Sem `JWT_SECRET` a aplicação não inicia (`AppModule` lança erro). Gere um
> valor seguro antes de subir os contêineres.

### Front-end (Vite)

Configure `.env` (desenvolvimento) e `.env.production` (build Docker) com as URLs oficiais.
Os assets de marca **devem ser servidos localmente** via `/brand/*` — nunca aponte para S3
ou outros domínios externos:

```
VITE_API_BASE=https://erpapi.noahomni.com.br/api
# Overrides opcionais (sempre caminhos locais). Se omitir, o front usa os fallbacks em /brand/*
VITE_NOAH_LOGO_LIGHT=/brand/logo-light.png
VITE_NOAH_LOGO_DARK=/brand/logo-dark.png
VITE_NOAH_FAVICON=/brand/favicon.ico
VITE_NOAH_APPLE_TOUCH=/brand/apple-touch-icon.png
VITE_NOAH_THEME_COLOR=#A8E60F
# Opcional: imagem customizada para o fundo da tela de login
VITE_LOGIN_BG=/brand/login-eclipse-desktop.png
VITE_LOGIN_BG_2X=/brand/login-eclipse@2x.png
VITE_LOGIN_BG_PORTRAIT=/brand/login-eclipse-mobile.png
```

O front aplica essas variáveis por meio de `src/branding.ts`, garantindo que qualquer URL
externa seja ignorada caso não pertença ao mesmo host publicado pelo Nginx.

## Desenvolvimento local

1. Instale as dependências compartilhadas: `npm install` na raiz do repositório.
2. (Opcional) Suba Postgres + Redis locais: `docker compose -f docker/compose.dev.yml up -d db redis`.
3. Aponte o Prisma para o banco local editando `apps/api/prisma/.env` (já contém a URL padrão `postgres://noah:noah@localhost:5432/noah`).
4. Execute a API em modo watch: `npm run --prefix apps/api start:dev`.
5. Rode o front: `npm run dev` (Vite em `http://localhost:5173`).

## Fluxo de deploy em produção

O passo a passo completo (pré-checagens, subida da stack, emissão de certificados, critérios
de aceite e runbook de upgrade) está documentado em
[`docs/production-runbook.md`](docs/production-runbook.md). Leia e siga cada item na ordem.

Resumo das variáveis mínimas antes de iniciar o deploy:

```bash
export DATABASE_URL="postgres://noah:noah@db:5432/noah"
export REDIS_URL="redis://redis:6379"
export JWT_SECRET="$(openssl rand -hex 48)"
export CORS_ORIGINS="https://erp.noahomni.com.br,https://erpapi.noahomni.com.br"
export ADMIN_NAME="Admin Noah"
export ADMIN_EMAIL="admin@noahomni.com.br"
export ADMIN_PASSWORD="D2W3£Qx!0Du#"   # ajuste após o primeiro login
export PRISMA_MIGRATE_ON_START=1
```

Para automatizar todas as etapas (checar Docker/Compose, validar DNS, construir imagens,
subir contêineres, emitir certificados via webroot e executar smoke tests), utilize o script
`scripts/provision_tls.sh`. Execute-o como root/sudo, definindo as variáveis de ambiente
necessárias (domínios, credenciais e IP esperado quando aplicável):

```bash
sudo DOMAIN_WEB="erp.noahomni.com.br" \
DOMAIN_API="erpapi.noahomni.com.br" \
ADMIN_EMAIL="admin@noahomni.com.br" \
ADMIN_PASSWORD="$ADMIN_PASSWORD" \
JWT_SECRET="$JWT_SECRET" \
./scripts/provision_tls.sh
```

O script interrompe a execução se qualquer pré-requisito falhar e imprime as ações corretivas.

## Deploy em Rocky Linux (script oficial)

> Requisitos: Rocky Linux 9/10 com acesso root, DNS dos domínios apontando para o servidor e portas 80/443 livres.

1. Faça o download/clonagem do repositório no servidor (ou deixe o script fazer isso na primeira execução).
2. Edite as variáveis no topo de `scripts/noah-erp_rocky.sh`:
   - `ERP_WEB_DOMAIN`, `ERP_API_DOMAIN`, `CERTBOT_EMAIL`
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - (Opcional) Ajustes de banco/redis/SELinux
3. Execute com root:
   - **Primeira instalação:** `sudo bash scripts/noah-erp_rocky.sh setup`
   - **Atualizar e re-subir:** `sudo bash scripts/noah-erp_rocky.sh upgrade`
   - **Checar saúde:** `sudo bash scripts/noah-erp_rocky.sh health`

### O que o script faz
- Instala Docker Engine + plugin `docker compose` (se necessário).
- Abre portas 80/443 no firewalld e aplica contextos SELinux.
- Prepara `.env` com variáveis da API/Proxy e `.env` do Front (`VITE_API_BASE`).
- Builda imagens e sobe `db`, `redis`, `api`, `web`, `proxy`.
- Emite certificados TLS com Certbot (modo webroot) e aplica reload no Nginx.
- Executa health checks:
  - `https://<ERP_API_DOMAIN>/api/worker/health` → sucesso (2xx)
  - `https://<ERP_WEB_DOMAIN>/` → 200/301/302

### Critérios de aceite (100% operante)
1. Containers `db`, `redis`, `api`, `web`, `proxy`, `certbot` em execução e saudáveis.
2. HTTPS ativo nos dois domínios com certificados válidos.
3. API responde 2xx em `/api/worker/health`.
4. Banco migrado e usuário admin criado/atualizado (variáveis `ADMIN_*`).
5. Front apontando para a API correta (`VITE_API_BASE`).

## Checklist pós-deploy

Após qualquer atualização valide a stack completa:

1. `docker compose -f docker/compose.prod.yml ps` → o serviço `proxy` deve estar com as
   portas `0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp`.
2. `docker compose -f docker/compose.prod.yml exec proxy nginx -t` → configuração válida.
3. `curl -sS https://erpapi.noahomni.com.br/api/worker/health` → `{"ok":true}`.
4. `curl -sS -X POST https://erpapi.noahomni.com.br/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"admin@noahomni.com.br","password":"D2W3£Qx!0Du#"}'` → retorna JWT.
5. `curl -I https://erp.noahomni.com.br` → `HTTP/2 200`.
6. Abrir o front no navegador e realizar login com o admin → verificar menus/rotas conforme
   ACL (admins visualizam todas as telas; perfis `SELLER`, `SUPPORT_NOAH` e `ADMIN_PARTNER`
   exibem apenas as seções permitidas).
7. Navegador → inspecionar `localStorage.token` e chamar `/api/auth/me` para garantir que o
   token JWT funciona.
8. Validar CORS: `curl -sS -H "Origin: https://erp.noahomni.com.br" -H "Access-Control-Request-Method: POST" -X OPTIONS https://erpapi.noahomni.com.br/api/auth/login -D -` deve incluir `access-control-allow-origin: https://erp.noahomni.com.br`.

> Utilize o script `scripts/ci_validate.sh` para automatizar os passos técnicos listados
> (builds, health checks, emissão de tokens e smoke tests HTTPS).

## Scripts úteis

- `scripts/update_and_rebuild.sh`: fluxo utilizado em produção para atualizar o repositório,
  rebuildar containers, aplicar migrations + seed e executar smoke tests básicos.
- `scripts/ci_validate.sh`: executa a rotina de validação completa descrita acima. Requer
  Docker/Compose disponíveis e acesso HTTPS aos domínios oficiais.
- `scripts/prisma_migrate_deploy.sh`: utilitário para rodar `prisma migrate deploy` dentro do
  container da API, aguardando o Postgres ficar pronto.

## Evidências e manutenção

- Prints do front (login e dashboard) devem ser anexados aos relatórios de entrega.
- Logs de build (`npm run --prefix apps/api build`, `npm run build`) e a saída dos `curl`
  (`/api/worker/health`, login) comprovam o funcionamento pós-deploy.
- Qualquer mudança futura precisa manter paridade com o arquivo Figma “Noah ERP Mockups”
  (disponível na pasta compartilhada). Melhorias são bem-vindas, mas não remova fluxos.

## Segurança

- Nunca comite `.env` com segredos reais.
- Sempre gere um novo `JWT_SECRET` em ambientes de produção.
- Troque a senha padrão do admin após o primeiro login, registrando a nova senha em um
  cofre seguro.

## Licença

Uso interno Noah Omni. Consulte a diretoria antes de redistribuir.

# Noah-ERP — Pre-merge Audit (Strict Proxy / Modo Degradado)

## Resumo
- Ambiente: STRICT-PROXY / NO-DOCKER (apt/egress 403; docker ausente).
- Escopo: validações estáticas de Compose, Nginx/ACME, API/Prisma/seed, Front, Scripts.
- Status geral: NOT READY TO MERGE até rodar Audit Completo com Docker/Compose.

### Evidências do ambiente
- Sistema operacional: `ubuntu 24.04` (`/etc/os-release`).
- `docker --version` → comando ausente.
- `docker compose version` → comando ausente.
- `curl -I https://download.docker.com/` → `403 Forbidden`.
- `curl -I https://registry-1.docker.io/` → `403 Forbidden`.
- `curl -I https://ghcr.io/` → `403 Forbidden`.

## Resultados por seção
### A) Compose/estrutura: PASS
- `docker/compose.prod.yml` define `db`, `redis`, `api`, `web`, `proxy` e `certbot`, com dependências (`api` → `db`, `redis`) e volumes compartilhados (`proxy` ↔ `certbot` via `certbot-www`).【F:docker/compose.prod.yml†L1-L69】

### B) Nginx/ACME/TLS: PASS
- `docker/nginx.conf` agora expõe servidor na porta 80 com `location /.well-known/acme-challenge/` apontando para `/var/www/certbot`, redireciona demais rotas para HTTPS e possui blocos `listen 443 ssl` utilizando os certificados emitidos pelo Certbot.【F:docker/nginx.conf†L1-L110】

### C) API/Prisma/Seed: PASS
- Prisma schema, migrations e seed presentes (`prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.js`).【F:prisma/schema.prisma†L1-L28】【F:prisma/migrations/0001_init/migration.sql†L1-L40】【F:prisma/seed.js†L1-L106】
- `apps/api/package.json` registra o seed em `"prisma": { "seed": "node ../prisma/seed.js" }`.【F:apps/api/package.json†L1-L32】
- Variáveis obrigatórias documentadas no README (DATABASE_URL, REDIS_URL, JWT_SECRET, CORS_ORIGINS, ADMIN_*, PRISMA_MIGRATE_ON_START).【F:README.md†L35-L100】
- Checklist: Prisma env uniqueness:
  - [x] `prisma/.env` não existe (falha imediata se reaparecer).
  - [x] `api/.env` é um symlink para `/etc/noah-erp/api.env`.
  - [x] `DATABASE_URL` aponta para o usuário `noah` (nunca `postgres`).

### D) Front (Vite): PASS
- `.env.example` na raiz indica `VITE_API_BASE=/api` e documenta os assets locais em `public/brand`.【F:.env.example†L1-L12】

### E) Scripts de deploy: PASS
- `scripts/noah-erp_rocky.sh` inclui shebang, subcomandos (`setup`, `upgrade`, `health`), checagens de Docker/Compose, firewalld/portas 80-443, DNS, ajustes SELinux, build/subida via Compose, emissão TLS com Certbot (webroot) e health checks de front/API.【F:scripts/noah-erp_rocky.sh†L1-L318】

### Observações complementares
- Branding e Login — OK (favicon .ico aplicado; UX revisada).

## Gaps bloqueadores (para Audit Completo)
- Docker/Compose indisponíveis no runner atual.
- Egress bloqueado para repositórios e registries necessários.

## Allowlist necessária no proxy (HTTPS/443)
- download.docker.com
- registry-1.docker.io
- auth.docker.io
- production.cloudflare.docker.com
- ghcr.io
- archive.ubuntu.com
- security.ubuntu.com
- apt.llvm.org
- mise.jdx.dev (se aplicável)
- github.com
- objects.githubusercontent.com

## Validação local (sem Docker)
Execute estes passos no runner/CI antes de qualquer teste que dependa de Docker. Eles garantem que o front e a API buildam com as dependências locais.

1. Detecte se o registry npm está acessível:
   ```bash
   npm run ci:probe-npm
   ```
2. Se o comando acima retornar `0`, rode a validação completa:
   ```bash
   npm run ci:full
   ```
3. Se o probe falhar (proxy 403), use o modo degradado — ele reutiliza `node_modules` já presentes no runner:
   ```bash
   npm run ci:degraded
   ```

> Observação: em ambientes com proxy estrito (403) é indispensável liberar a allowlist de rede listada acima ou utilizar um mirror interno. O modo degradado cobre apenas o front-end; ao liberar o egress, retome o fluxo completo (`npm run ci:full`) e regenere os lockfiles.

## Como validar em produção
- `docker compose -f docker/compose.prod.yml config` deve renderizar sem erros.
- `curl -I http://erp.noahomni.com.br/.well-known/acme-challenge/test` deve responder `200` durante a emissão.
- Após a emissão, `curl -I https://erp.noahomni.com.br` e `curl -I https://erpapi.noahomni.com.br` devem responder `200` com HSTS habilitado.

## Opções para viabilizar o Audit Completo
1. Usar runner com Docker/Compose pré-instalados e egress liberado (ex.: GitHub-hosted).
2. Provisionar runner interno com mirrors aprovados pela TI.
3. Apontar para Docker remoto interno via `DOCKER_HOST` (rede isolada e segura).
4. Executar o audit completo diretamente no servidor Rocky (mapear portas 8080/8443 para evitar conflito).

## Critério de desbloqueio (para READY TO MERGE)
- Reexecutar Audit Completo em ambiente com Docker/Compose e egress liberado:
  - `docker compose -f docker/compose.prod.yml build`
  - Subir `db` e `redis`, aguardar `pg_isready`
  - Subir `api` e `web`, checar logs com `prisma generate` + `migrate deploy`
  - `docker compose -f docker/compose.prod.yml exec api npx prisma db seed`
  - Subir `proxy`, validar `nginx -t`
  - Health checks HTTP: `GET http://localhost:8080/` (200/301/302) e `GET http://localhost:8080/api/worker/health` (2xx)
  - Monitorar logs por 2 minutos sem erros persistentes

## Conclusão
- Estado da PR: **NOT READY TO MERGE** enquanto o Audit Completo não for executado com sucesso.
- Próximo passo: liberar allowlist de rede ou usar runner com Docker habilitado, corrigir o Nginx para HTTPS/ACME e repetir o audit completo.

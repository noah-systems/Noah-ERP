# Noah-ERP – Pre-merge Audit (Rocky deploy PR) — Reexecução

## Resumo
- **Ambiente (Parte 1): FAIL** — `apt-get update` e `curl` foram bloqueados pelo proxy corporativo (HTTP 403), impedindo a instalação do Docker/Compose; o binário `docker` continua ausente no runner.
- **Audit Completo (Parte 2): FAIL** — não executado porque Docker/Compose não estão disponíveis; etapas de build, migrations e health checks permanecem pendentes.
- **Modo Degradado (Parte 3): Parcial** —
  - **Compose:** PASS
  - **Nginx/ACME/TLS:** FAIL (faltam blocos HTTPS e webroot ACME)
  - **API/Prisma:** PASS
  - **Front:** PASS
  - **Scripts de deploy:** PASS

A recomendação final permanece **NÃO APTO PARA MERGE** até que o audit completo seja executado em ambiente com Docker/Compose e egress liberados.

## Parte 1 — Tentativa de correção do ambiente
1. **Identificação do SO:** `source /etc/os-release` → `ubuntu 24.04` (planejado uso de `apt-get`).【912935†L1-L4】
2. **Instalação de pacotes base:** `apt-get update` falhou com `403 Forbidden` para mirrors oficiais; sem conectividade não foi possível instalar Docker.【2e586e†L1-L24】
3. **Validação do Docker:** `docker --version` → `command not found: docker` (confirma ausência da engine).【eedee5†L1-L3】
4. **Teste de egress externo:** `curl -I https://download.docker.com/` → `HTTP/1.1 403 Forbidden`, reforçando bloqueio de saída HTTPS exigido para instalação/imagems.【e06f7b†L1-L9】

**Ação imediata:** liberar egress HTTPS para `download.docker.com`, `registry-1.docker.io`, `auth.docker.io`, `production.cloudflare.docker.com` (e `ghcr.io`, se necessário) ou usar runner já equipado com Docker/Compose.

## Parte 2 — Audit completo (Docker/Compose)
- **Status:** NÃO EXECUTADO. Todas as etapas (build, migrations, seeds, nginx -t, health checks via 8080/8443) dependem de Docker e devem ser repetidas após sanar o ambiente.

## Parte 3 — Audit em modo degradado (somente análise estática)
### Compose (PASS)
- `docker/compose.prod.yml` define os serviços `db`, `redis`, `api`, `web`, `proxy` e `certbot`, com volumes `letsencrypt`/`certbot-www` compartilhados entre proxy e certbot e publicação das portas 80/443 pelo proxy.【F:docker/compose.prod.yml†L1-L63】
- `api` depende de `db` e `redis` e exporta variáveis obrigatórias (`DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, `CORS_ORIGINS`, `ADMIN_*`, `PRISMA_MIGRATE_ON_START`).【F:docker/compose.prod.yml†L18-L36】

### Nginx/ACME/TLS (FAIL)
- `docker/nginx.conf` possui apenas blocos `server` na porta 80 para `erpapi.noahomni.com.br` e `erp.noahomni.com.br`, sem `listen 443 ssl`, sem `ssl_certificate`/`ssl_certificate_key` e sem `location /.well-known/acme-challenge/` apontando para `/var/www/certbot`. Isso inviabiliza o método webroot exigido pelo Certbot e impede HTTPS.【F:docker/nginx.conf†L1-L36】

### API/Prisma (PASS)
- `apps/api/package.json` registra o script Prisma seed (`"prisma": { "seed": "node prisma/seed.js" }`).【F:apps/api/package.json†L1-L34】
- `apps/api/prisma/schema.prisma` existe, referencia `env("DATABASE_URL")` e define o schema completo; o diretório `apps/api/prisma/migrations/` contém a migration inicial (`0001_init`) e o `migration_lock.toml`, confirmando versionamento de schema.【F:apps/api/prisma/schema.prisma†L1-L28】【c9f528†L1-L3】
- O seed `apps/api/prisma/seed.js` cria/atualiza o admin usando `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, garantindo idempotência do usuário de acesso.【F:apps/api/prisma/seed.js†L1-L74】

### Front (PASS)
- `.env.example` inclui `VITE_API_BASE` com sufixo `/api`, alinhado ao proxy público exigido pelo deploy.【F:.env.example†L1-L10】

### Scripts de deploy (PASS)
- `scripts/noah-erp_rocky.sh` fornece subcomandos `setup`, `upgrade` e `health`, instala Docker/Compose em Rocky Linux, abre portas 80/443 via firewalld, aplica contextos SELinux, gera `.env`, executa build, sobe db/redis/api/web/proxy, emite TLS via Certbot webroot e roda health checks (API e front).【F:scripts/noah-erp_rocky.sh†L1-L164】

## Ações recomendadas (prioridade)
1. **Infra:** habilitar Docker Engine + plugin `docker compose` no ambiente de audit (ou usar runner pré-configurado) com egress liberado.
2. **Proxy/TLS:** atualizar `docker/nginx.conf` para incluir redirecionamento 80→443, blocos HTTPS com certificados do Certbot e `location /.well-known/acme-challenge/` servindo `/var/www/certbot`.
3. **Reexecução:** após os ajustes, repetir a Parte 2 completa (build, migrations, seed, nginx -t, health checks em 8080/8443) e anexar logs/códigos de resposta.

**Bloqueadores para audit completo:** ausência de Docker/Compose no runner (`docker --version` indisponível) e egress HTTPS bloqueado para mirrors Docker/Ubuntu (HTTP 403).【eedee5†L1-L3】【2e586e†L1-L24】【e06f7b†L1-L9】

## Conclusão
**Status geral:** NÃO APTO PARA MERGE.

O merge só deve prosseguir após executar o audit completo com Docker funcional e corrigir o proxy Nginx para suportar ACME + HTTPS.

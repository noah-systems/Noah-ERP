# Noah ERP – Runbook de Produção

Este runbook descreve o fluxo completo para provisionar, validar e atualizar o Noah ERP em produção. Execute os passos na ordem apresentada para garantir que todos os critérios de aceite sejam atendidos.

> **Diretório base:** todos os comandos assumem que você está em `/opt/noah-erp/Noah-ERP` (raiz do repositório, onde fica `docker/compose.prod.yml`).

## 1. Pré-checagens obrigatórias

1. **Docker e Compose:**
   ```bash
   command -v docker
   docker compose version
   ```
   Se qualquer comando falhar, instale o Docker Engine (24+) e o plugin oficial `docker compose` antes de prosseguir.
2. **Privilégios elevados:** confirme que você pode executar Docker e comandos de rede como root/sudo:
   ```bash
   sudo -v
   ```
   Em seguida utilize `sudo` (ou execute como root) para rodar os comandos deste runbook.
3. **Portas 80/443 livres:**
   ```bash
   sudo ss -ltnp | egrep ':80|:443'
   ```
   Se houver processos ocupando as portas, interrompa-os antes do deploy (por exemplo, outro Nginx/Apache/Traefik).
4. **DNS apontando para o servidor:** substitua `<IP_DO_SERVIDOR>` pelo IP público do host e valide:
   ```bash
   dig +short erp.noahomni.com.br A
   dig +short erpapi.noahomni.com.br A
   ```
   Apenas prossiga quando ambos os domínios resolverem para o IP correto.

## 2. Preparação do repositório

1. Clone o repositório (ou atualize o existente):
   ```bash
   sudo mkdir -p /opt/noah-erp
   cd /opt/noah-erp
   sudo git clone https://github.com/noahomni/Noah-ERP.git Noah-ERP   # se ainda não existir
   cd Noah-ERP
   sudo git fetch origin
   sudo git checkout main
   sudo git pull --ff-only origin main
   ```
2. Verifique que o diretório atual contém `docker/compose.prod.yml` e os scripts.

## 3. Variáveis de ambiente mínimas

### 3.1 API (`apps/api`)

Defina (por export ou arquivo `.env`) antes de subir os contêineres. Exemplos:

```bash
export DATABASE_URL="postgres://noah:noah@db:5432/noah"
export REDIS_URL="redis://redis:6379"
export JWT_SECRET="$(openssl rand -hex 48)"
export CORS_ORIGINS="https://erp.noahomni.com.br,https://erpapi.noahomni.com.br"
export ADMIN_NAME="Admin Noah"
export ADMIN_EMAIL="admin@noahomni.com.br"
export ADMIN_PASSWORD="D2W3£Qx!0Du#"   # troque assim que possível
export PRISMA_MIGRATE_ON_START=1
```

> **Importante:** `JWT_SECRET` é obrigatório — a API não inicia sem este valor. `PRISMA_MIGRATE_ON_START=1` garante migrations + seed automáticos.

### 3.2 Frontend (Vite)

Crie/ajuste `.env.production` com o endpoint público da API (sempre terminando em `/api`):

```dotenv
VITE_API_BASE=https://erpapi.noahomni.com.br/api
```

### 3.3 Certificados TLS

Defina os domínios e o e-mail de contato antes de executar o script de provisionamento:

```bash
export DOMAIN_WEB="erp.noahomni.com.br"
export DOMAIN_API="erpapi.noahomni.com.br"
export ADMIN_EMAIL="admin@noahomni.com.br"
```

## 4. Subida da stack em produção (Docker Compose)

1. **Build das imagens:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml build
   ```
2. **Infraestrutura base:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml up -d db redis
   sudo docker compose -f docker/compose.prod.yml exec -T db pg_isready -U noah -d noah
   ```
   Repita o `pg_isready` até receber `accepting connections`.
3. **Aplicações e proxy:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml up -d api web proxy certbot
   ```
   A API executará `prisma migrate deploy` + seed no boot graças ao `PRISMA_MIGRATE_ON_START=1`.
4. **Emissão inicial dos certificados (método webroot):**
   ```bash
   sudo docker compose -f docker/compose.prod.yml run --rm \
     --entrypoint certbot \
     certbot certonly --webroot -w /var/www/certbot \
     -d "$DOMAIN_WEB" -d "$DOMAIN_API" \
     -m "$ADMIN_EMAIL" --agree-tos --no-eff-email --rsa-key-size 4096
   ```
5. **Validação do Nginx e reload:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml exec -T proxy nginx -t
   sudo docker compose -f docker/compose.prod.yml exec -T proxy nginx -s reload
   ```
6. **Renovação automática:** o serviço `certbot` já roda `certbot renew --webroot -w /var/www/certbot` a cada 12h. Após uma renovação, execute o reload do Nginx para carregar os novos certificados.

## 5. Validação – "Aceite 100%"

Execute todas as checagens abaixo. Caso alguma falhe, consulte a seção de troubleshooting.

1. **Containers saudáveis:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml ps
   ```
   Certifique-se de que `db`, `redis`, `api`, `web`, `proxy` e `certbot` estão como `Up` e que o proxy expõe `0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp`.
2. **Nginx OK:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml exec -T proxy nginx -t
   ```
3. **Front HTTPS:**
   ```bash
   curl -fsSI --resolve "$DOMAIN_WEB:443:127.0.0.1" "https://$DOMAIN_WEB/" | head -n 1
   ```
   Deve retornar `HTTP/2 200` (ou redirecionamento 301/302 para a home).
4. **Saúde da API:**
   ```bash
   curl -fsS --resolve "$DOMAIN_API:443:127.0.0.1" "https://$DOMAIN_API/api/worker/health"
   ```
5. **Seed/Admin:**
   ```bash
   curl -fsS --resolve "$DOMAIN_API:443:127.0.0.1" \
     -H "Content-Type: application/json" \
     -d '{"email":"'$ADMIN_EMAIL'","password":"'$ADMIN_PASSWORD'"}' \
     "https://$DOMAIN_API/api/auth/login"
   ```
   Receba um JWT válido. Ajuste a senha após o primeiro login.
6. **Front consumindo API correta:** abra o front no navegador ou utilize `curl` para garantir que `VITE_API_BASE` aponta para `https://$DOMAIN_API/api`.
7. **Certbot em execução:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml logs --tail=20 certbot
   ```
   A saída deve indicar `certbot renew` executando a cada 12h.

## 6. Troubleshooting (ordem de prioridade)

1. **Docker/Compose ausentes:** instale e reexecute o passo 4.
2. **Portas 80/443 ocupadas:** finalize o serviço conflitante e retome o passo 4.
3. **DNS incorreto:** ajuste os registros A e aguarde a propagação completa antes de emitir certificados.
4. **Emissão TLS falhou:** garanta que `/.well-known/acme-challenge/` esteja acessível via HTTP (passos 4.4/4.5) e repita a emissão.
5. **API não sobe:** revise `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL` e consulte `docker compose logs api` para erros de migration.
6. **Seed/Admin ausente:** reexecute `docker compose exec -T api npm run prisma:seed` com `ADMIN_*` corretos.
7. **Front sem API:** ajuste `VITE_API_BASE` e `CORS_ORIGINS`, rebuild `web` e reinicie `proxy`.

## 7. Runbook de upgrade

1. **Planejamento:** defina janela de manutenção e garanta backup recente do banco.
2. **Sincronização:**
   ```bash
   sudo git fetch origin
   sudo git pull --ff-only origin main
   ```
3. **Reconstrução:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml build
   ```
4. **Reinício controlado:**
   ```bash
   sudo docker compose -f docker/compose.prod.yml up -d api web proxy
   ```
   Reinicie `db` e `redis` apenas se houver mudança nas imagens.
5. **Migrations automáticas:** confirme nos logs da API que `prisma migrate deploy` executou.
6. **Seed idempotente:** mantenha `ADMIN_*` exportadas; o seed atualizará o usuário sem duplicar.
7. **Smoke tests pós-update:**
   - Front HTTPS (`curl` ou navegador).
   - API `GET /api/worker/health`.
   - Login do admin recém-seedado.
8. **Critério de aceite do upgrade:** todos os itens da seção 5 aprovados após o restart.
9. **Rollback:** se algum check crítico falhar, retorne para a revisão anterior (`git checkout <commit_antigo>`), rebuild apenas os serviços afetados e repita os testes da seção 5.
10. **Pós-implantação:** monitore `docker compose logs` por alguns minutos, observando erros de banco, CORS ou proxy. Registre a versão implantada e alterações relevantes.

## 8. Relatório final

- **Aprovado:** reporte `APROVADO: 100% OPERANTE` somente quando todos os itens 5.1–5.7 estiverem OK.
- **Reprovado:** entregue um sumário curto indicando qual item falhou, a causa provável e a ação corretiva seguindo a ordem de prioridade: Docker/Compose → DNS/portas → emissão TLS/Nginx → saúde da API → migrations/seed → front/CORS.

## Automação auxiliar

O script [`scripts/provision_tls.sh`](../scripts/provision_tls.sh) implementa as checagens e automações descritas acima (pré-requisitos, build/subida dos serviços, emissão de certificados e smoke tests). Ajuste as variáveis de ambiente (`DOMAIN_WEB`, `DOMAIN_API`, `ADMIN_EMAIL`, `EXPECTED_PUBLIC_IP`, credenciais do admin etc.) e execute:

```bash
sudo DOMAIN_WEB="erp.noahomni.com.br" \
DOMAIN_API="erpapi.noahomni.com.br" \
ADMIN_EMAIL="admin@noahomni.com.br" \
JWT_SECRET="$JWT_SECRET" \
ADMIN_PASSWORD="$ADMIN_PASSWORD" \
./scripts/provision_tls.sh
```

O script interrompe a execução com mensagens claras caso algum pré-requisito não seja atendido e lista as ações corretivas necessárias.

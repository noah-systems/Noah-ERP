# Guia de validação (QA)

Este documento concentra os testes funcionais mínimos para cada entrega do Noah ERP. Utilize-o em conjunto com o roteiro de CI (`scripts/ci_validate.sh`).

## 1. Preparação do ambiente

1. Certifique-se de que Docker, Node.js 20 e `curl` estão instalados.
2. Exporte (ou defina em um arquivo `.env`) as credenciais que serão usadas nos testes, quando necessário:
   ```bash
   export ADMIN_EMAIL="admin@noahomni.com.br"
   export ADMIN_PASSWORD="D2W3£Qx!0Du#"
   export SELLER_EMAIL="seller.qa@noahomni.com.br"
   export SELLER_PASSWORD="Seller@123"
   ```
3. Execute o script completo de validação local:
   ```bash
   ./scripts/ci_validate.sh
   ```
   O script compila API e front, sobe o stack de produção (`docker/compose.prod.yml`), valida o `nginx`, checa health checks, ACLs e derruba a stack ao final.

## 2. Checks obrigatórios

### 2.1 Health checks

```bash
curl -fsS http://localhost:3000/api/worker/health | jq
```

### 2.2 Autenticação

```bash
# Login admin
curl -fsS -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@noahomni.com.br","password":"D2W3£Qx!0Du#"}'

# Usar o token para validar ACL
curl -fsS -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/auth/me
```

### 2.3 ACL (SELLER)

```bash
TOKEN=$(curl -fsS -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"seller.qa@noahomni.com.br","password":"Seller@123"}' \
  | jq -r '.token')

curl -o /dev/null -w '%{http_code}\n' \
  -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:3000/api/users
# Esperado: 403
```

### 2.4 CORS

```bash
curl -sS -o /dev/null -D - -X OPTIONS http://localhost:3000/api/auth/login \
  -H 'Origin: https://erp.noahomni.com.br' \
  -H 'Access-Control-Request-Method: POST'
```
Confirme se o cabeçalho `access-control-allow-origin` lista a origem esperada.

## 3. Checklist por papel

| Papel            | Entrar | Acesso a /users | Notas |
|------------------|--------|-----------------|-------|
| ADMIN_NOAH       | ✅     | ✅              | Pode gerir pricing, leads, opps. |
| SUPPORT_NOAH     | ✅     | ❌ (limitado)   | Deve enxergar saúde de worker. |
| SELLER           | ✅     | ❌ (403)        | Restrito a leads/opps do time. |

> Para papéis adicionais (`FINANCE_NOAH`, `PARTNER_*`), concentre-se nas telas e permissões descritas no Figma. Registre prints dos fluxos principais (login, leads, oportunidades, pricing, implantação) para anexar no relatório.

## 4. Evidências obrigatórias

- Captura de tela do dashboard pós-login (tema Noah aplicado).
- Resultado do comando `./scripts/ci_validate.sh`.
- Prints dos estados de loading/empty/error quando aplicável.

## 5. Pós-validação

1. Rode `docker compose -f docker/compose.prod.yml down -v` para limpar o ambiente.
2. Revise o `README.md` para confirmar se credenciais temporárias foram rotacionadas após os testes.

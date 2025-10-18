# QA rápido (Noah ERP)

## Fluxo mínimo
1. Login via `/api/auth/login` com admin seedado → 200 + token
2. GET `/api/auth/me` com Bearer token → 200
3. POST `/api/leads` `{ "title": "Lead QA", "value": 1234 }` → 201/200, retorna id
4. POST `/api/leads/:id/move` `{ "to": "Won" }` → 200
5. GET `/api/leads` contém o id criado → 200
6. DELETE `/api/leads/:id` → 200/204

## CORS
- OPTIONS `/api/auth/login` → 204 + `Access-Control-Allow-*` completos

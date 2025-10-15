# Noah ERP Mockups

This is a code bundle for Noah ERP Mockups. The original project is available at https://www.figma.com/design/7bPowTaiTuZjAda0gbT0aL/Noah-ERP-Mockups.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

### Executando Prisma e o banco de dados localmente

- Inicie os serviços de infraestrutura com `docker compose -f docker/compose.dev.yml up -d db redis` para expor o PostgreSQL em `localhost:5432`.
- As credenciais padrão criam o banco `noah` com usuário e senha `noah`.
- Os comandos Prisma executados fora dos contêineres leem a URL de conexão de `prisma/.env`, que já aponta para `postgres://noah:noah@localhost:5432/noah`.
- Ao usar o `docker/compose.dev.yml`, o serviço `api` tem as variáveis `DATABASE_URL` e `REDIS_URL` sobrescritas para utilizar os hosts `db` e `redis` dentro da rede Docker, evitando o erro `P1001: Can't reach database server at db:5432` quando os comandos são executados na máquina local.

## Manutenção do ambiente com Docker

Para reproduzir rapidamente a sequência de atualização utilizada em produção, execute o script `scripts/update_and_rebuild.sh`. Ele realiza o stash das alterações locais, atualiza a branch via `git pull --rebase` e reconstrói os serviços Docker definidos em `docker/compose.prod.yml`, garantindo também que as migrations Prisma e o usuário administrador padrão sejam aplicados.

### Aplicando migrations Prisma manualmente

Caso precise rodar apenas as validações e migrations do Prisma em um ambiente semelhante ao de produção, utilize o script `scripts/prisma_migrate_deploy.sh`. Ele inicializa os serviços do PostgreSQL e do Redis, aguarda o banco de dados aceitar conexões via `pg_isready` diretamente no contêiner do banco e executa `prisma validate`, `prisma generate` e `prisma migrate deploy` na sequência. Isso evita falhas por tentar acessar o banco antes dele estar pronto para uso.

## HTTPS (erp.noahomni.com.br e erpapi.noahomni.com.br)

1. Construa e suba todos os serviços, incluindo o loop de renovação automática do Certbot:

   ```bash
   docker compose -f docker/compose.prod.yml up -d --build
   ```

2. Solicite os certificados para os dois domínios usando o webroot compartilhado com o Nginx:

   ```bash
   docker compose -f docker/compose.prod.yml run --rm certbot \
     certonly --webroot -w /var/www/certbot \
     -d erp.noahomni.com.br -d erpapi.noahomni.com.br \
     --email admin@noahomni.com.br --agree-tos --no-eff-email
   ```

3. Valide e recarregue a configuração do Nginx para carregar os certificados recém-criados:

   ```bash
   docker compose -f docker/compose.prod.yml exec proxy nginx -t
   docker compose -f docker/compose.prod.yml exec proxy nginx -s reload
   ```

4. Teste rapidamente os hosts protegidos por TLS:

   ```bash
   curl -I https://erp.noahomni.com.br
   curl -sS https://erpapi.noahomni.com.br/api/worker/health
   ```

O serviço `certbot` executa `certbot renew` a cada 12 horas. Quando a renovação ocorrer, os certificados atualizados serão carregados automaticamente pelas próximas conexões do Nginx, mas você pode executar `docker compose -f docker/compose.prod.yml exec proxy nginx -s reload` caso deseje forçar o reload imediato.

## Front end de produção

O projeto agora inclui uma tela mínima de autenticação em Vite que conversa diretamente com a API NestJS (`/api/auth/login` e `/api/auth/me`). O objetivo é validar o fluxo completo (login + sessão) enquanto o layout definitivo do Figma é implementado por etapas.

### Variáveis de ambiente do front

Copie o arquivo `.env.example` para `.env` na raiz do front (mesma pasta deste README) e ajuste os valores de branding/URL da API conforme necessário:

```env
VITE_API_BASE=https://erpapi.noahomni.com.br/api
VITE_LOGO_LIGHT=/brand/logo-light.png
VITE_LOGO_DARK=/brand/logo-dark.png
VITE_FAVICON=/brand/favicon.png
VITE_APPLE_TOUCH=/brand/apple-touch.png
VITE_THEME_COLOR=#A8E60F
VITE_LOGIN_BG=/brand/login-bg.jpg
```

A pasta `public/brand/` já está versionada apenas com um README de instruções.
Adicione manualmente os arquivos de imagem (logos, favicon, apple-touch, login background)
antes de fazer o deploy ou gerar o build final.

A variável `VITE_API_BASE` aceita tanto a raiz `/api` (quando o front é servido pelo mesmo host) quanto a URL completa com domínio. Se você apontar apenas para `https://erpapi.noahomni.com.br`, o cliente automaticamente prefixará as rotas com `/api`.

### Publicando o front definitivo (bundle do Figma)

Se você já possui o bundle final (build do front), coloque os arquivos em `webapp/` e execute:

```bash
docker compose -f docker/compose.prod.yml build web proxy
docker compose -f docker/compose.prod.yml up -d web proxy
```

Caso o diretório `webapp/` não exista ou esteja vazio, o Dockerfile atual continuará gerando e servindo a tela mínima construída com Vite.

### Próximos passos sugeridos

- Após o login, implemente as rotas “/leads”, “/opps” e “/pricing” consumindo as rotas já mapeadas no NestJS.
- Componentize o layout (sidebar/topbar) e aplique o design final do Figma.
- Para suportar múltiplas marcas, carregue dinamicamente os logos e cores utilizando as variáveis expostas no arquivo `.env`.

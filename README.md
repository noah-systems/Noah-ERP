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

# Deploy Manual do Noah-ERP

Este guia descreve como provisionar o Noah-ERP em um servidor LEMP sem depender de Docker. As instruções foram testadas em distribuições baseadas em Debian/Ubuntu e podem exigir pequenas adaptações em outras plataformas.

## 1. Preparar o servidor

1. Atualize o sistema operacional e instale as dependências principais (Node.js 20+, PostgreSQL 15+ e Redis 6+).
2. Garanta que as portas 80 e 443 estejam liberadas no firewall para acesso HTTP/HTTPS.
3. Configure o DNS apontando o domínio desejado para o endereço IP do servidor.

> **Dica:** o script [`install.sh`](./install.sh) automatiza estes passos para ambientes limpos. Execute-o como `root` somente em servidores dedicados, pois ele instala pacotes e sobrescreve configurações do Nginx.

## 2. Configurar o banco de dados

1. Execute o script [`database-setup.sql`](./database-setup.sql) com privilégios administrativos no PostgreSQL:
   ```bash
   psql -U postgres -f database-setup.sql
   ```
2. Verifique se o usuário `noah_user` consegue conectar localmente:
   ```bash
   psql postgresql://noah_user:SEU_PASSWORD@localhost:5432/noah_erp -c "SELECT current_database();"
   ```

## 3. Clonar e configurar a aplicação

1. Clone o repositório para `/var/www/<dominio>` ou diretório equivalente.
2. Copie `.env.example` para `.env` e ajuste as variáveis conforme o ambiente (credenciais, URL da aplicação e chaves secretas).

## 4. Instalar dependências

1. Instale as dependências Node.js e gere os artefatos front-end e back-end:
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run build:web
   npm run build:api
   ```

## 5. Preparar a aplicação

1. Execute a seed para criar o usuário administrador padrão, caso necessário:
   ```bash
   node prisma/seed.js
   ```

## 6. Configurar o Nginx

1. Sirva o diretório `dist/` do frontend com o servidor HTTP da sua preferência (Nginx, Caddy, etc.).
2. Configure o reverse proxy para encaminhar `/api` para o processo Node que executa a API (`npm run start:api`).
3. (Opcional) Habilite HTTPS com Let’s Encrypt/Certbot.

## 7. Serviços auxiliares

- **Filas (BullMQ/Redis):** garanta que um serviço Redis local esteja em execução (`systemctl enable --now redis`).
- **Agendadores:** utilize `node scripts/qa-smoke.mjs` ou crie jobs específicos conforme as rotinas necessárias.
- **Processamento de filas:** configure o supervisor ou systemd para executar o worker Node.js que utiliza Redis.

## 8. Pós-deploy

1. Monitore os logs do servidor HTTP e da API Node para garantir que não existam erros.
2. Valide as rotas principais da API e do frontend.
3. Realize testes de upload e filas para confirmar que permissões e Redis estão corretos.

Seguindo estas etapas, o Noah-ERP ficará pronto para operar em ambientes tradicionais LEMP, dispensando completamente o uso de Docker.

# Deploy Manual do Noah-ERP

Este guia descreve como provisionar o Noah-ERP em um servidor LEMP sem depender de Docker. As instruções foram testadas em distribuições baseadas em Debian/Ubuntu e podem exigir pequenas adaptações em outras plataformas.

## 1. Preparar o servidor

1. Atualize o sistema operacional e instale as dependências principais (Nginx, PHP 8.1, MySQL 8.0+ e Node.js 18+).
2. Garanta que as portas 80 e 443 estejam liberadas no firewall para acesso HTTP/HTTPS.
3. Configure o DNS apontando o domínio desejado para o endereço IP do servidor.

> **Dica:** o script [`install.sh`](./install.sh) automatiza estes passos para ambientes limpos. Execute-o como `root` somente em servidores dedicados, pois ele instala pacotes e sobrescreve configurações do Nginx.

## 2. Configurar o banco de dados

1. Execute o script [`database-setup.sql`](./database-setup.sql) com privilégios administrativos no MySQL:
   ```bash
   mysql -u root -p < database-setup.sql
   ```
2. Verifique se o usuário `noah_user` consegue conectar localmente:
   ```bash
   mysql -u noah_user -p -e "SHOW DATABASES;"
   ```

## 3. Clonar e configurar a aplicação

1. Clone o repositório para `/var/www/<dominio>` ou diretório equivalente.
2. Copie `.env.example` para `.env` e ajuste as variáveis conforme o ambiente (credenciais, URL da aplicação e chaves secretas).
3. Garanta que as permissões das pastas estejam corretas:
   ```bash
   chmod -R 755 storage bootstrap/cache public/uploads
   chown -R www-data:www-data storage bootstrap/cache public/uploads
   ```

## 4. Instalar dependências

1. Instale as dependências PHP com o Composer em modo produção:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
2. Instale dependências Node.js e gere os artefatos front-end e back-end:
   ```bash
   npm install
   npm run build
   ```

## 5. Preparar a aplicação

1. Gere a chave da aplicação (`php artisan key:generate`).
2. Execute as migrações, seeds e crie o link de storage:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   php artisan storage:link
   ```
3. Crie o usuário administrador conforme necessidade (veja o bloco `php artisan tinker` em `install.sh`).

## 6. Configurar o Nginx

1. Crie um virtual host apontando para `public/` conforme o template disponibilizado em `install.sh`.
2. Habilite o site, teste a configuração (`nginx -t`) e recarregue o serviço (`systemctl reload nginx`).
3. (Opcional) Habilite HTTPS com Let’s Encrypt/Certbot.

## 7. Serviços auxiliares

- **Filas (BullMQ/Redis):** garanta que um serviço Redis local esteja em execução (`systemctl enable --now redis`).
- **Agendadores:** utilize `php artisan schedule:run` via cron ou equivalentes (ex.: `* * * * * php /var/www/<dominio>/artisan schedule:run >> /dev/null 2>&1`).
- **Processamento de filas:** configure o supervisor ou systemd para executar o worker Node.js que utiliza Redis.

## 8. Pós-deploy

1. Monitore os logs do Nginx, PHP-FPM e da aplicação para garantir que não existam erros.
2. Valide as rotas principais da API e do frontend.
3. Realize testes de upload e filas para confirmar que permissões e Redis estão corretos.

Seguindo estas etapas, o Noah-ERP ficará pronto para operar em ambientes tradicionais LEMP, dispensando completamente o uso de Docker.

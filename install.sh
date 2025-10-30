#!/bin/bash
# Script de instalação manual do Noah-ERP
echo "Instalando Noah-ERP..."

# Configurações
DB_HOST="localhost"
DB_NAME="noah_erp"
DB_USER="noah_user"
DB_PASS="q@9dlyU0AAJ9"
ADMIN_PASS="D2W3£Qx!0Du#"
APP_URL="erp.noahomni.com.br"

# Instalar dependências do sistema
apt update && apt upgrade -y
apt install -y git nginx php8.1 php8.1-fpm php8.1-mysql php8.1-xml \
php8.1-curl php8.1-zip php8.1-gd php8.1-mbstring php8.1-bcmath \
mysql-server mysql-client nodejs npm

# Configurar MySQL
mysql -e "CREATE DATABASE ${DB_NAME};"
mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Clonar e configurar aplicação
cd /var/www
git clone https://github.com/noah-systems/Noah-ERP.git ${APP_URL}
cd ${APP_URL}

# Instalar dependências PHP via Composer
curl -sS https://getcomposer.org/installer | php
php composer.phar install --no-dev --optimize-autoloader

# Instalar dependências Node.js
npm install
npm run build

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Configurar .env SEM configurações Docker
sed -i "s/DB_HOST=.*/DB_HOST=127.0.0.1/" .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USER}/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/" .env
sed -i "s/APP_URL=.*/APP_URL=https:\/\/${APP_URL}/" .env

# Executar migrações
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link

# Configurar Nginx
cat > /etc/nginx/sites-available/${APP_URL} << EONGINX
server {
    listen 80;
    server_name ${APP_URL};
    root /var/www/${APP_URL}/public;
    index index.php;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
}
EONGINX

ln -s /etc/nginx/sites-available/${APP_URL} /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Criar usuário admin
php artisan tinker --execute="
use Illuminate\\Support\\Facades\\Hash;
\$user = new App\\Models\\User();
\$user->name = 'Admin';
\$user->email = 'admin@${APP_URL}';
\$user->password = Hash::make('${ADMIN_PASS}');
\$user->email_verified_at = now();
\$user->save();
"

echo "Instalação concluída! Acesse: https://${APP_URL}"

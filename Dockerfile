# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем необходимые пакеты
RUN apk add --no-cache \
    php \
    php-apache2 \
    php-curl \
    php-json \
    php-mbstring \
    php-openssl \
    php-phar \
    php-zip \
    php-ctype \
    php-dom \
    php-xml \
    php-xmlreader \
    php-xmlwriter \
    composer \
    apache2 \
    && rm -rf /var/cache/apk/*

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости Node.js
RUN npm ci --only=production

# Копируем все файлы проекта
COPY . .

# Создаем структуру для веб-сервера
RUN mkdir -p /var/www/html

# Копируем PHP файлы в корень веб-сервера
RUN cp -r php/* /var/www/html/

# Настраиваем Apache для PHP
RUN echo "LoadModule php_module /usr/lib/apache2/modules/libphp.so" >> /etc/apache2/httpd.conf && \
    echo "AddHandler php-script .php" >> /etc/apache2/httpd.conf && \
    echo "DirectoryIndex index.php index.html" >> /etc/apache2/httpd.conf && \
    echo "DocumentRoot /var/www/html" >> /etc/apache2/httpd.conf && \
    echo "<Directory /var/www/html>" >> /etc/apache2/httpd.conf && \
    echo "    AllowOverride All" >> /etc/apache2/httpd.conf && \
    echo "    Require all granted" >> /etc/apache2/httpd.conf && \
    echo "    Options Indexes FollowSymLinks" >> /etc/apache2/httpd.conf && \
    echo "</Directory>" >> /etc/apache2/httpd.conf && \
    echo "LoadModule rewrite_module modules/mod_rewrite.so" >> /etc/apache2/httpd.conf && \
    echo "LoadModule headers_module modules/mod_headers.so" >> /etc/apache2/httpd.conf

# Создаем .htaccess для CORS
RUN echo "Header always set Access-Control-Allow-Origin *" > /var/www/html/.htaccess && \
    echo "Header always set Access-Control-Allow-Methods 'GET, POST, OPTIONS'" >> /var/www/html/.htaccess && \
    echo "Header always set Access-Control-Allow-Headers 'Content-Type'" >> /var/www/html/.htaccess

# Устанавливаем зависимости PHP
WORKDIR /var/www/html
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Возвращаемся в рабочую директорию
WORKDIR /app

# Создаем скрипт запуска
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'apache2 -D FOREGROUND &' >> /app/start.sh && \
    echo 'sleep 2' >> /app/start.sh && \
    echo 'node openai-chat-backend.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Открываем порты
EXPOSE 80 3001

# Запускаем оба сервера
CMD ["/app/start.sh"] 
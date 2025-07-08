FROM php:8.2-apache

# Установить необходимые расширения PHP
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Установить Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Копировать composer файлы и установить зависимости
COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader

# Копировать все файлы проекта
COPY . .

# Включить нужные модули Apache
RUN a2enmod rewrite headers

# CORS для API
RUN echo "Header always set Access-Control-Allow-Origin *" > .htaccess && \
    echo "Header always set Access-Control-Allow-Methods 'GET, POST, OPTIONS'" >> .htaccess && \
    echo "Header always set Access-Control-Allow-Headers 'Content-Type'" >> .htaccess

# Права
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
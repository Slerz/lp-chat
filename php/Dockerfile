FROM php:8.2-apache

# Устанавливаем необходимые расширения PHP
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Копируем composer файлы
COPY composer.json composer.lock ./

# Устанавливаем зависимости PHP
RUN composer install --no-dev --optimize-autoloader

# Копируем все файлы проекта
COPY . .

# Настраиваем Apache
RUN a2enmod rewrite headers

# Создаем .htaccess для CORS
RUN echo "Header always set Access-Control-Allow-Origin *" > .htaccess && \
    echo "Header always set Access-Control-Allow-Methods 'GET, POST, OPTIONS'" >> .htaccess && \
    echo "Header always set Access-Control-Allow-Headers 'Content-Type'" >> .htaccess

# Устанавливаем права доступа
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"] 
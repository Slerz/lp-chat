FROM php:8.2-apache

# Установить необходимые пакеты: git, unzip, zip и зависимости для zip-расширения
RUN apt-get update && \
    apt-get install -y git unzip zip libzip-dev && \
    docker-php-ext-configure zip && \
    docker-php-ext-install zip

# Установить composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Копируем все файлы проекта в директорию Apache
COPY . /var/www/html/

WORKDIR /var/www/html

RUN composer install

# Устанавливаем необходимые расширения PHP (раскомментируй, если нужно)
# RUN docker-php-ext-install mysqli pdo pdo_mysql

EXPOSE 80 
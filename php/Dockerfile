FROM php:8.2-cli
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y libzip-dev unzip && docker-php-ext-install zip
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install
EXPOSE 8080
CMD ["php", "-S", "0.0.0.0:8080", "-t", "api"]
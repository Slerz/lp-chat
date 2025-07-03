FROM php:8.2-apache

# Включаем mod_rewrite для поддержки .htaccess
RUN a2enmod rewrite

# Копируем все файлы проекта
COPY . /var/www/html/

# Исправляем права (опционально, если будут проблемы с доступом)
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Настраиваем AllowOverride для .htaccess
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

EXPOSE 80
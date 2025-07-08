# PHP API для LP Chat

Отдельный PHP сервис для обработки заявок из чатбота и формы обратной связи.

## Деплой на Railway

### 1. Создайте новый проект на Railway
- Зайдите на [railway.app](https://railway.app)
- Создайте новый проект
- Подключите этот репозиторий

### 2. Настройте переменные окружения (опционально)
В Railway Dashboard добавьте:
- `SMTP_HOST` = smtp.gmail.com
- `SMTP_USERNAME` = ваш_email@gmail.com
- `SMTP_PASSWORD` = ваш_пароль_приложения
- `RECIPIENT_EMAIL` = email_для_получения_заявок

### 3. Деплой
```bash
railway up
```

## API Endpoints

### POST /api/send_contact.php
Отправляет заявку на email.

**Параметры:**
- `name` (обязательно) - имя пользователя
- `phone` (обязательно) - телефон
- `messenger` (опционально) - мессенджер
- `city` (опционально) - город
- `chat_history` (опционально) - история чата

**Ответ:**
```json
{
  "success": true,
  "message": "Заявка успешно отправлена!"
}
```

## Интеграция с основным проектом

После деплоя PHP сервиса получите его URL (например: `https://php-api-production.up.railway.app`) и обновите URL в основном проекте:

### В js/app.js:
```javascript
url: 'https://php-api-production.up.railway.app/api/send_contact.php'
```

### В js/feedback.js:
```javascript
$.ajax('https://php-api-production.up.railway.app/api/send_contact.php', {
```

## Структура проекта

```
php/
├── api/
│   └── send_contact.php    # Основной API endpoint
├── config/
│   └── mail.php           # Конфигурация почты
├── vendor/                 # Composer зависимости
├── composer.json          # Зависимости PHP
├── Dockerfile             # Конфигурация Docker
└── railway.json           # Конфигурация Railway
```

## Безопасность

- Все входные данные проходят валидацию и экранирование
- Используется HTTPS для SMTP соединений
- Пароли и конфиденциальные данные хранятся в конфигурационных файлах

## Логирование

Для добавления логирования создайте файл `src/Logger.php` и интегрируйте его в класс `Mailer`.

## Поддержка

При возникновении проблем проверьте:
1. Правильность SMTP настроек
2. Доступность SMTP сервера
3. Корректность email адресов
4. Логи ошибок PHP 
# PHP Mailer для LP Chat

Этот пакет предоставляет функциональность для отправки email сообщений в приложении LP Chat.

## Установка

1. Установите зависимости через Composer:
```bash
composer install
```

2. Настройте конфигурацию в файле `config/mail.php`:
   - Укажите SMTP настройки вашего почтового сервера
   - Замените `your-email@gmail.com` на ваш email
   - Замените `your-app-password` на пароль приложения (для Gmail)

## Настройка Gmail

Для использования Gmail в качестве SMTP сервера:

1. Включите двухфакторную аутентификацию в вашем Google аккаунте
2. Создайте пароль приложения:
   - Перейдите в настройки безопасности Google
   - Выберите "Пароли приложений"
   - Создайте новый пароль для "Почта"
3. Используйте этот пароль в конфигурации

## Использование

### Базовое использование

```php
require_once 'vendor/autoload.php';

use App\Mailer;

$config = require_once 'config/mail.php';
$mailer = new Mailer($config['smtp']);

// Отправка простого email
$mailer->sendEmail(
    'recipient@example.com',
    'Тема письма',
    '<h1>Привет!</h1><p>Содержание письма</p>'
);
```

### Отправка формы контакта

```php
$formData = [
    'name' => 'Иван Иванов',
    'phone' => '+7 (999) 123-45-67',
    'city' => 'Москва',
    'question' => 'Вопрос пользователя'
];

$mailer->sendContactForm($formData);
```

### Отправка уведомления

```php
$mailer->sendNotification(
    'admin@example.com',
    'Новый пользователь',
    'На сайте зарегистрировался новый пользователь.'
);
```

## API Endpoints

### POST /api/send_contact.php

Отправляет данные формы контакта.

**Параметры:**
- `name` (обязательный) - имя пользователя
- `phone` (обязательный) - телефон пользователя
- `city` (обязательный) - город пользователя
- `question` (обязательный) - вопрос пользователя

**Пример запроса:**
```javascript
fetch('/php/api/send_contact.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: 'Иван Иванов',
        phone: '+7 (999) 123-45-67',
        city: 'Москва',
        question: 'Вопрос пользователя'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Структура файлов

```
php/
├── composer.json          # Зависимости Composer
├── config/
│   └── mail.php          # Конфигурация email
├── src/
│   └── Mailer.php        # Основной класс Mailer
├── api/
│   └── send_contact.php  # API endpoint для формы контакта
├── send_email.php        # Пример использования
├── Dockerfile            # Docker конфигурация
└── README.md            # Документация
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
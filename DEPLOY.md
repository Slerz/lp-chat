# Деплой LP Chat на Railway

Этот проект состоит из двух отдельных сервисов, которые нужно развернуть на Railway.

## 1. Основной проект (Node.js + Frontend)

### Шаги деплоя:

1. **Создайте новый проект на Railway**
   - Зайдите на [railway.app](https://railway.app)
   - Создайте новый проект
   - Подключите этот репозиторий

2. **Настройте переменные окружения**
   В Railway Dashboard добавьте:
   ```
   OPENAI_API_KEY=ваш_ключ_openai
   PORT=3001
   ```

3. **Деплой**
   ```bash
   railway up
   ```

4. **Получите URL основного проекта**
   После деплоя получите URL (например: `https://lp-chat-production.up.railway.app`)

## 2. PHP API проект

### Шаги деплоя:

1. **Создайте отдельный проект на Railway**
   - Создайте еще один новый проект на Railway
   - Подключите папку `php/` как отдельный репозиторий

2. **Настройте переменные окружения (опционально)**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_USERNAME=ваш_email@gmail.com
   SMTP_PASSWORD=ваш_пароль_приложения
   RECIPIENT_EMAIL=email_для_получения_заявок
   ```

3. **Деплой**
   ```bash
   cd php
   railway up
   ```

4. **Получите URL PHP API**
   После деплоя получите URL (например: `https://php-api-production.up.railway.app`)

## 3. Обновите URL в основном проекте

После деплоя обоих проектов обновите URL в файлах:

### В js/app.js:
```javascript
// Замените на URL вашего PHP API
url: 'https://php-api-production.up.railway.app/api/send_contact.php'
```

### В js/feedback.js:
```javascript
// Замените на URL вашего PHP API
$.ajax('https://php-api-production.up.railway.app/api/send_contact.php', {
```

## 4. Проверка работы

1. **Проверьте чатбот** - откройте основной URL и протестируйте диалог
2. **Проверьте отправку заявок** - заполните форму обратной связи
3. **Проверьте email** - убедитесь, что заявки приходят на указанный email

## Структура проектов

```
lp-chat/                    # Основной проект (Node.js)
├── openai-chat-backend.js  # Node.js сервер
├── js/app.js              # Frontend логика чатбота
├── js/feedback.js         # Frontend логика формы
├── index.html             # Главная страница
└── Dockerfile             # Конфигурация для основного проекта

php/                       # PHP API проект
├── api/send_contact.php   # PHP endpoint
├── config/mail.php        # Конфигурация почты
├── composer.json          # PHP зависимости
└── Dockerfile             # Конфигурация для PHP проекта
```

## Преимущества такого подхода

1. **Разделение ответственности** - каждый сервис отвечает за свою часть
2. **Простота деплоя** - каждый проект можно деплоить независимо
3. **Масштабируемость** - можно масштабировать сервисы отдельно
4. **Надежность** - если один сервис упадет, другой продолжит работать 
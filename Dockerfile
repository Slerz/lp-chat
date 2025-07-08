# Используем официальный образ Node.js
FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости Node.js
RUN npm ci --only=production

# Копируем все файлы проекта
COPY . .

# Открываем порт
EXPOSE 3001

# Запускаем Node.js сервер
CMD ["node", "openai-chat-backend.js"] 
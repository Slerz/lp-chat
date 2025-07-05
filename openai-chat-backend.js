require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Статические файлы
app.use(express.static(path.join(__dirname)));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY_2?.trim();
const PORT = process.env.PORT || 3001;
const sessions = {};

// Проверяем наличие API ключа при запуске
if (!OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OPENAI_API_KEY not configured!');
} else {
  console.log('✅ OpenAI API key configured');
}

// Загружаем promt.txt при запуске
const promtPath = path.join(__dirname, 'chat-gpt-data', 'promt.txt');
let promtText = '';
try {
  promtText = fs.readFileSync(promtPath, 'utf8');
} catch (e) {
  console.error('Ошибка загрузки promt.txt:', e.message);
  promtText = 'Ошибка загрузки promt.txt';
}

const SYSTEM_PROMPT = {
  role: 'system',
  content: promtText
};

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница благодарности
app.get('/thanks', (req, res) => {
  res.sendFile(path.join(__dirname, 'thanks.html'));
});

// Тестовый эндпоинт для проверки API ключа
app.get('/test-api', (req, res) => {
  const rawKey = process.env.OPENAI_API_KEY;
  const cleanKey = OPENAI_API_KEY;
  
  res.json({
    apiKeyConfigured: !!cleanKey,
    apiKeyLength: cleanKey ? cleanKey.length : 0,
    apiKeyPrefix: cleanKey ? cleanKey.substring(0, 7) + '...' : 'none',
    rawKeyLength: rawKey ? rawKey.length : 0,
    rawKeyPrefix: rawKey ? rawKey.substring(0, 10) + '...' : 'none',
    environment: process.env.NODE_ENV || 'development',
    hasWhitespace: rawKey ? rawKey !== rawKey.trim() : false
  });
});

app.post('/chat', async (req, res) => {
  console.log('Chat request received:', { message: req.body.message?.substring(0, 50) + '...', sessionId: req.body.sessionId });
  
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    console.log('Missing required fields:', { message: !!message, sessionId: !!sessionId });
    return res.status(400).json({ error: 'message and sessionId required' });
  }

  if (!OPENAI_API_KEY) {
    console.log('API key not configured');
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }
  
  console.log('API key configured, length:', OPENAI_API_KEY.length);

  // Инициализация истории для сессии
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }

  // Добавляем сообщение пользователя в историю
  sessions[sessionId].push({ role: 'user', content: message });

  // Формируем массив messages для OpenAI: system prompt + история (ограничиваем до 12)
  const shortHistory = sessions[sessionId].slice(-12);
  const messages = [SYSTEM_PROMPT, ...shortHistory];

  console.log('Sending request to OpenAI with model: gpt-3.5-turbo');
  console.log('Messages count:', messages.length);

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-mini',
      messages,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const aiMessage = response.data.choices[0].message.content;
    // Добавляем ответ бота в историю
    sessions[sessionId].push({ role: 'assistant', content: aiMessage });
    res.json({ text: aiMessage });
  } catch (error) {
    console.error('OpenAI API error:', error.response ? error.response.data : error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    res.status(500).json({ 
      error: 'Ошибка при обращении к OpenAI API', 
      details: error.message,
      status: error.response?.status
    });
  }
});

app.listen(PORT, () => console.log(`OpenAI chat backend running on port ${PORT}`));
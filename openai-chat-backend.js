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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3001;
const sessions = {};

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

app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'message and sessionId required' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  // Инициализация истории для сессии
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }

  // Добавляем сообщение пользователя в историю
  sessions[sessionId].push({ role: 'user', content: message });

  // Формируем массив messages для OpenAI: system prompt + история
  const messages = [SYSTEM_PROMPT, ...sessions[sessionId]];

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages
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
    res.status(500).json({ error: 'Ошибка при обращении к OpenAI API', details: error.message });
  }
});

app.listen(PORT, () => console.log(`OpenAI chat backend running on port ${PORT}`)); 
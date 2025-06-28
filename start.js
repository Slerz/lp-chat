const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск Shefport Chatbot...');

// Запускаем бэкенд OpenAI
const backend = spawn('node', ['openai-chat-backend.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Запускаем веб-сервер
const webServer = spawn('npx', ['http-server', '.', '-p', '8080'], {
  stdio: 'inherit',
  cwd: __dirname
});

console.log('✅ Бэкенд запущен на http://localhost:3001');
console.log('✅ Веб-сервер запущен на http://localhost:8080');
console.log('🌐 Откройте браузер и перейдите по адресу: http://localhost:8080');

// Обработка завершения процессов
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка серверов...');
  backend.kill();
  webServer.kill();
  process.exit();
});

backend.on('close', (code) => {
  console.log(`Бэкенд завершен с кодом ${code}`);
});

webServer.on('close', (code) => {
  console.log(`Веб-сервер завершен с кодом ${code}`);
}); 
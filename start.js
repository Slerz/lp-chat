const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск Shefport Chatbot...');

// Запускаем бэкенд OpenAI
const backend = spawn('node', ['openai-chat-backend.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Запускаем PHP сервер для обработки форм
const phpServer = spawn('php', ['-S', 'localhost:8000'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'php')
});

// Запускаем веб-сервер с прокси
const webServer = spawn('node', ['node_modules/http-server/bin/http-server', '.', '-p', '8080', '--proxy', 'http://localhost:3001'], {
  stdio: 'inherit',
  cwd: __dirname
});

console.log('✅ Бэкенд запущен на http://localhost:3001');
console.log('✅ PHP сервер запущен на http://localhost:8000');
console.log('✅ Веб-сервер запущен на http://localhost:8080');
console.log('🌐 Откройте браузер и перейдите по адресу: http://localhost:8080');

// Обработка завершения процессов
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка серверов...');
  backend.kill();
  phpServer.kill();
  webServer.kill();
  process.exit();
});

backend.on('close', (code) => {
  console.log(`Бэкенд завершен с кодом ${code}`);
});

phpServer.on('close', (code) => {
  console.log(`PHP сервер завершен с кодом ${code}`);
});

webServer.on('close', (code) => {
  console.log(`Веб-сервер завершен с кодом ${code}`);
}); 
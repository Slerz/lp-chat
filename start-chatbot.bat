@echo off
cd /d "%~dp0"
call npm install
start cmd /k "node openai-chat-backend.js"
start cmd /k "npm run start:web"
timeout /t 3
start http://127.0.0.1:8080 
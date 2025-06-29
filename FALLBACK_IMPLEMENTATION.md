# Fallback механизм для чат-бота ШефПорт

## Описание

Реализован автоматический fallback механизм, который переключает чат-бот с AI режима (ChatGPT) на сценарный режим при ошибках доступа к серверам.

## Основные компоненты

### 1. Глобальные переменные
```javascript
let isScenarioMode = false; // Флаг для отслеживания режима работы
```

### 2. Функция переключения режимов
```javascript
function switchToScenarioMode() {
  if (isScenarioMode) return;
  
  isScenarioMode = true;
  showModeIndicator();
  
  appendMessage({ 
    text: '🤖 Переключился на сценарный режим...', 
    isUser: false 
  });
  
  setTimeout(() => {
    processChatState("start");
  }, 1500);
}
```

### 3. Обработка ошибок в sendMessageToAI
```javascript
// При ошибке сервера
} catch (e) {
  console.log('Ошибка соединения с AI сервером, переключаемся на сценарный режим:', e);
  appendMessage({ text: 'Переключаюсь на сценарный режим...', isUser: false });
  hideTypingIndicator();
  switchToScenarioMode();
  
  // Повторно обрабатываем сообщение в сценарном режиме
  setTimeout(() => {
    handleScenarioModeMessage(userMessage);
  }, 1000);
}
```

### 4. Интеллектуальная обработка сообщений в сценарном режиме
```javascript
function handleScenarioModeMessage(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Возврат к AI режиму
  if (message.includes('ai') || message.includes('chatgpt')) {
    appendMessage({ text: 'Попробую снова подключиться к AI серверу...', isUser: false });
    setTimeout(() => {
      sendMessageToAI("__INIT__");
    }, 1000);
    return;
  }
  
  // Сопоставление с сценариями
  if (message.includes('инвестиции') || message.includes('деньги')) {
    processChatState("investments");
  } else if (message.includes('прибыль') || message.includes('заработок')) {
    processChatState("profit");
  }
  // ... другие сценарии
}
```

## Визуальные индикаторы

### 1. HTML индикатор режима
```html
<div class="chat__mode-indicator" id="modeIndicator" style="display: none;">
  <span class="mode-indicator__text">Сценарный режим</span>
</div>
```

### 2. CSS стили
```css
.chat__mode-indicator {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6b35;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  animation: fadeInMode 0.3s ease-in;
}
```

### 3. JavaScript функции управления
```javascript
function showModeIndicator() {
  const modeIndicator = document.getElementById('modeIndicator');
  if (modeIndicator) {
    modeIndicator.style.display = 'block';
  }
}

function hideModeIndicator() {
  const modeIndicator = document.getElementById('modeIndicator');
  if (modeIndicator) {
    modeIndicator.style.display = 'none';
  }
}
```

## Логика работы

### 1. Нормальный режим (AI)
- Бот работает с ChatGPT
- Индикатор режима скрыт
- Все сообщения отправляются на `/chat` endpoint

### 2. При ошибке ChatGPT
- Обнаруживается ошибка в `sendMessageToAI`
- Показывается сообщение о переключении
- Вызывается `switchToScenarioMode()`
- Показывается индикатор "Сценарный режим"
- Запускается начальный сценарий

### 3. Сценарный режим
- Бот работает по заранее подготовленным сценариям
- Сообщения анализируются ключевыми словами
- Пользователь может вернуться к AI режиму, написав "AI" или "ChatGPT"

### 4. Возврат к AI режиму
- При успешном ответе от ChatGPT автоматически скрывается индикатор
- При ручном запросе пользователя происходит попытка переподключения

## Тестирование

### 1. Автоматическое тестирование
- Откройте `test-fallback.html` для симуляции различных сценариев
- Проверьте переключение между режимами

### 2. Ручное тестирование
1. Откройте основной чат-бот (`index.html`)
2. Попробуйте отправить сообщение
3. При недоступности ChatGPT проверьте автоматическое переключение
4. В сценарном режиме напишите "AI" для возврата

### 3. Проверка индикаторов
- Индикатор режима должен появляться при переключении на сценарий
- Индикатор должен исчезать при возврате к AI режиму
- Сообщения о переключении должны быть информативными

## Преимущества реализации

1. **Надежность**: Чат-бот продолжает работать даже при недоступности ChatGPT
2. **Прозрачность**: Пользователь видит, в каком режиме работает бот
3. **Гибкость**: Возможность возврата к AI режиму при восстановлении сервера
4. **Интеллектуальность**: Умное сопоставление сообщений с сценариями
5. **UX**: Плавные переходы и информативные сообщения

## Возможные улучшения

1. **Кэширование**: Сохранение последних ответов ChatGPT для offline работы
2. **Адаптивность**: Обучение на основе пользовательских запросов
3. **Мониторинг**: Логирование переключений для анализа
4. **Настройки**: Возможность пользователю выбрать предпочтительный режим 
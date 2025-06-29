// Хранение данных
const chatHistory = [];

const chatContent = document.getElementById("chatContent");
const typingIndicator = document.getElementById("typingIndicator");
const botNotificationSound = new Audio('audio/ringtone.mp3');
let lastOptions = null;
let isBotBusy = false;
let allowedScroll = false;
let botMessageCount = 0;
let swiperInstance = null;
let isProcessingBreak = false; // Флаг для отслеживания обработки [BREAK]
let isScenarioMode = false; // Новый флаг для отслеживания режима работы

import startQuestions from './startQuestions.js';
import messengerOptions from './messengerOptions.js';
import cityInput from './cityInput.js';
import nameInput from './nameInput.js';
import phoneInput from './phoneInput.js';
import freeQuestionInput from './freeQuestionInput.js';
import renderGallerySwiper from './gallerySwiper.js';
import renderYesNoOptions from './yesNoOptions.js';

$(document).one("click", ".response-options button", function() {
  allowedScroll = true
});

function animateFadeIn(element) {
  anime({
    targets: element,
    opacity: [0, 1],
    translateY: [-10, 0],
    duration: 600,
    easing: "easeOutQuad",
  });
}

function smoothScrollToBottom() {
  if (!allowedScroll) {
    return
  }

  anime({
    targets: [document.documentElement, document.body],
    scrollTop: chatContent.scrollHeight + 40,
    duration: 800,
    easing: "easeInOutQuad",
  });
}

function displayStatus(status) {
  const statusContainer = document.querySelector('#status');
  
  if (statusContainer) {
    if (status) {

      statusContainer.style.display = 'block';
      anime({
        targets: statusContainer,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 800,
        easing: 'easeOutQuad',
      });
    } else {
      statusContainer.style.display = 'none';
    }
  }
}

function clearOptions() {
  if (lastOptions) {
    lastOptions.remove();
    lastOptions = null;
  }
}

// Парсер спецсимволов для markdown-стиля (жирный, списки)
function parseSpecialFormatting(text) {
  if (typeof text !== 'string') return text;
  // Экранирование HTML
  let safe = text.replace(/[&<>]/g, function(tag) {
    const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return chars[tag] || tag;
  });
  // Жирный текст **текст**
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Перенос нумерованных списков (1. ... 2. ...)
  // В начале строки или после \n, ищем "число. " и переносим на новую строку
  safe = safe.replace(/(\d+\.) /g, '\n$1 ');
  // Удаляем лишний перенос в начале
  safe = safe.replace(/^\n+/, '');
  // Переводим \n в <br>
  safe = safe.replace(/\n/g, '<br>');
  return safe;
}

function appendMessage({ text, value, key, isUser, skipScroll, isBreakPart }) {
  // Скрыть [END_CONVERSATION] для пользователя
  if (typeof text === 'string' && text.includes('[END_CONVERSATION]')) {
    const cleaned = text.replace(/\[END_CONVERSATION\]/g, '').trim();
    if (cleaned) {
      appendMessage({ text: cleaned, value, key, isUser, skipScroll });
    }
    return;
  }
  // Парсер меток для интерактивных элементов
  if (!isUser && typeof text === 'string') {
    // [BREAK] - с задержкой между частями для сообщений от бота
    if (text.includes('[BREAK]')) {
      const parts = text.split('[BREAK]').map(part => part.trim()).filter(Boolean);
      isProcessingBreak = true; // Устанавливаем флаг
      (async function showPartsWithDelay() {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          // Используем рекурсивный вызов appendMessage для обработки всех меток в каждой части
          // Передаем флаг isProcessingBreak чтобы индикатор не скрывался
          appendMessage({ text: part, value, key, isUser, skipScroll, isBreakPart: true });
          
          // Задержка 1100мс между частями, кроме последней
          if (i < parts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1100));
          }
        }
        // Скрываем индикатор печати только после обработки ВСЕХ частей
        isProcessingBreak = false; // Сбрасываем флаг
        setTimeout(() => {
          hideTypingIndicator();
        }, 600);
      })();
      return;
    }
    // [START_QUESTIONS]
    if (text.includes('[START_QUESTIONS]')) {
      const parts = text.split('[START_QUESTIONS]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderModuleOptionsWithAI('startQuestions', startQuestions);
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[START_QUESTIONS]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_CITY]
    if (text.includes('[ASK_CITY]')) {
      const parts = text.split('[ASK_CITY]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderCityInputWithAI(key || 'city', (userCity) => {});
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_CITY]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_PHONE]
    if (text.includes('[ASK_PHONE]')) {
      const parts = text.split('[ASK_PHONE]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderPhoneInputWithAI(key || 'phone', (userPhone) => {});
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_PHONE]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_MESSENGER]
    if (text.includes('[ASK_MESSENGER]')) {
      const parts = text.split('[ASK_MESSENGER]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderModuleOptionsWithAI(key || 'messenger', messengerOptions);
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_MESSENGER]', timestamp: new Date().toISOString() });
      return;
    }
    // [SHOW_MAGNET_OPTIONS]
    if (text.includes('[SHOW_MAGNET_OPTIONS]')) {
      const parts = text.split('[SHOW_MAGNET_OPTIONS]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderYesNoOptionsWithAI(key || 'magnet');
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[SHOW_MAGNET_OPTIONS]', timestamp: new Date().toISOString() });
      return;
    }
    // [PHOTO]
    if (text.includes('[PHOTO]')) {
      const parts = text.split('[PHOTO]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      // Пример набора фото (можно заменить на реальные пути)
      const photos = [
        { src: 'images/gallery-img-1.jpg' },
        { src: 'images/gallery-img-2.jpg' },
        { src: 'images/gallery-img-3.jpg' },
        { src: 'images/gallery-img-4.jpg' },
        { src: 'images/gallery-img-5.jpg' },
        { src: 'images/gallery-img-6.jpg' }
      ];
      renderGallerySwiper(photos);
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[PHOTO]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_NAME]
    if (text.includes('[ASK_NAME]')) {
      const parts = text.split('[ASK_NAME]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderNameInput(key || 'name', () => {});
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_NAME]', timestamp: new Date().toISOString() });
      return;
    }
  }

  const message = document.createElement("div");
  message.className = `message ${isUser ? "user-message" : "bot-message"}`;
  // Применяем парсер только для сообщений бота
  const formattedText = isUser ? text : parseSpecialFormatting(text);
  message.innerHTML = `<p>${formattedText}</p>`;
  chatContent.appendChild(message);

  chatHistory.push({
    sender: isUser ? "user" : "bot",
    key: key,
    message: value || text,
    timestamp: new Date().toISOString(),
  });

  animateFadeIn(message);
  if (!isUser) {
    swiperInstance = message;
    // Воспроизводим звуковой сигнал для сообщений от бота
    botNotificationSound.play();
    // Скрываем индикатор печати для обычных сообщений от бота
    // НО только если это не часть [BREAK] последовательности
    if (!isProcessingBreak && !isBreakPart) {
      setTimeout(() => {
        hideTypingIndicator();
      }, 600);
    }
  }
  if (!skipScroll) smoothScrollToBottom();

  return message;
}

function showTypingIndicator(delay) {

  anime({
    targets: typingIndicator,
    opacity: 1,
    duration: 400,
    translateX: [-2, 0],
    easing: 'easeInOutQuad',
    begin: () => {
      if (typingIndicator) {
        typingIndicator.style.display = 'block';
      }
    },
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      anime({
        targets: typingIndicator,
        opacity: 0,
        duration: 200,
        translateX: [0, 0],
        easing: 'easeInOutQuad',
        complete: () => {
          if (typingIndicator) {
            typingIndicator.style.display = 'none';
          }
          resolve()
          },
        });
    }, delay)
  })
}

// Функция для скрытия индикатора печати
function hideTypingIndicator() {
  if (typingIndicator) {
    anime({
      targets: typingIndicator,
      opacity: 0,
      duration: 200,
      translateX: [0, 0],
      easing: 'easeInOutQuad',
      complete: () => {
        if (typingIndicator) {
          typingIndicator.style.display = 'none';
        }
      },
    });
  }
}

// Функция для показа индикатора печати без автоматического скрытия
function showTypingIndicatorManual() {
  if (typingIndicator) {
    anime({
      targets: typingIndicator,
      opacity: 1,
      duration: 400,
      translateX: [-2, 0],
      easing: 'easeInOutQuad',
      begin: () => {
        if (typingIndicator) {
          typingIndicator.style.display = 'block';
        }
      },
    });
  }
}

async function appendBotMessageWithDelay(message, key) {
  const delayMap = {
    'text':  Math.min(message.value.length * 18, 4000),
    'swiper': 2000,
    'yesno': 500,
  }

  isBotBusy = true;

  await showTypingIndicator(delayMap[message.type] || 0);
  // Задержка 300мс перед каждым сообщением бота
  await new Promise(resolve => setTimeout(resolve, 300));

  botNotificationSound.play();

  switch(message.type) {
    case 'text':
      appendMessage({ text: message.value, key: key });
      break;
    case 'swiper':
      renderGallerySwiper(message.value);
      break;
    case 'options':
      renderOptions(key, message.value);
      break;
    case 'yesno':
      renderYesNoOptionsWithAI(key, message.next);
      break;
  }

  isBotBusy = false;
}

function renderOptions(key, options) {
  clearOptions();

  const responseContainer = document.createElement("div");
  responseContainer.className = "response-options";

  options.forEach(({ label, value, next }) => {
    const button = document.createElement("button");
    button.type = 'button';
    button.innerHTML = label;
    button.onclick = () => {
      if (isBotBusy) return;
      appendMessage({ text: label, value: value, key: key, isUser: true });

      if (/^questionFranchise\d*$/.test(key) && swiperInstance) {
        swiperInstance.remove();
        swiperInstance = null;
      }

      clearOptions();
      processChatState(next);
    };
    responseContainer.appendChild(button);
  });

  chatContent.appendChild(responseContainer);
  animateFadeIn(responseContainer);
  smoothScrollToBottom();
  lastOptions = responseContainer;
}

function renderSwiper(swiperItems) {
  const itemsTemplate = swiperItems.map(({ src }) => `
    <div class="swiper-slide">
      <div>
        <img class="tap-color" src="${src}" alt="${src.split('/').pop()}" />
      </div>
    </div>
  `)

  const template = `
    <div class="swiper-container swiper-chat">
      <div class="swiper-wrapper">
        ${itemsTemplate.join('')}
      </div>
      <div class="gallery-pagination swiper-bullets"></div>
    </div>
  `

  const element = new DOMParser()
    .parseFromString(template, "text/html")
    .body
    .firstElementChild;

  chatContent.appendChild(element);
  animateFadeIn(element);
  smoothScrollToBottom();

  new Swiper(element, {
    speed: 450,
    effect: 'slide',
    rewind: true,
    grabCursor: true,
    pagination: {
      el: '.gallery-pagination',
      clickable: true,
    },
    breakpoints: {
      200: {
        spaceBetween: 10,
        slidesPerView: 1,
      },
      768: {
        spaceBetween: 14,
        slidesPerView: 3,
      },
      1400: {
        spaceBetween: 22,
        slidesPerView: 3,
      },
    },
  });
}

function renderTextInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "input";

  const textarea = document.createElement("textarea");
  textarea.className = "input__field input__field--textarea";
  textarea.placeholder = "Напишите ваш вопрос...";

  inputWrapper.appendChild(textarea);

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.className = "btn";
  submitButton.textContent = "Отправить";
  submitButton.onclick = () => {
    const userInput = textarea.value.trim();
    if (!userInput) return;

    appendMessage({ text: userInput, key: key, isUser: true });
    inputContainer.remove();
    if (callback) callback(userInput);
  };

  inputContainer.appendChild(inputWrapper);
  inputContainer.appendChild(submitButton);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;
}

function renderPhoneInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const form = document.createElement("form");
  form.className = "dynamic-form";

  const inputField = document.createElement("input");
  inputField.type = "tel";
  inputField.name = "phone";
  inputField.placeholder = "Ваш телефон";
  inputField.className = "input__field";
  inputField.autocomplete = "off";

  Inputmask({ mask: "+7 (999) 999 9999", showMaskOnHover: false }).mask(inputField);

  const submitButton = document.createElement("button");
  submitButton.className = "btn";
  submitButton.type = "submit";
  submitButton.textContent = "Отправить";

  form.appendChild(inputField);
  form.appendChild(submitButton);
  inputContainer.appendChild(form);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;

  $(form).validate({
    errorPlacement: function () {},
    rules: {
      phone: {
        required: true,
        phone: true,
      },
    },
    submitHandler: function () {
      const phoneNumber = inputField.value.trim();
      inputContainer.remove();
      appendMessage({ text: phoneNumber, key: key, isUser: true });
      // Переходим к следующему шагу сценария
      if (callback) callback(phoneNumber);
      const state = chatScenario[key];
      if (state && state.next) processChatState(state.next);
    },
  });
}

function renderCityInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const form = document.createElement("form");
  form.className = "dynamic-form";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.name = "city";
  inputField.placeholder = "Ваш город";
  inputField.className = "input__field";
  inputField.autocomplete = "off";

  const submitButton = document.createElement("button");
  submitButton.className = "btn";
  submitButton.type = "submit";
  submitButton.textContent = "Отправить";

  form.appendChild(inputField);
  form.appendChild(submitButton);
  inputContainer.appendChild(form);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;

  $(form).validate({
    errorPlacement: function () {},
    rules: {
      city: {
        required: true,
      },
    },
    submitHandler: function () {
      const userCity = inputField.value.trim();
      inputContainer.remove();
      if (callback) callback(userCity);
    },
  });
}

function renderNameInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const form = document.createElement("form");
  form.className = "dynamic-form";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.name = "name";
  inputField.placeholder = "Ваше имя";
  inputField.className = "input__field";
  inputField.autocomplete = "off";

  $(inputField).on("input", function () {
    let value = $(this).val();
    $(this).val(value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, ""));
  });

  const submitButton = document.createElement("button");
  submitButton.className = "btn";
  submitButton.type = "submit";
  submitButton.textContent = "Отправить";

  form.appendChild(inputField);
  form.appendChild(submitButton);
  inputContainer.appendChild(form);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;

  $(form).validate({
    errorPlacement: function () {},
    rules: {
      name: {
        required: true,
      },
    },
    submitHandler: function () {
      const userName = inputField.value.trim();
      inputContainer.remove();
      appendMessage({ text: userName, key: key, isUser: true });
      // Переходим к следующему шагу сценария
      if (callback) callback(userName);
      const state = chatScenario[key];
      if (state && state.next) processChatState(state.next);
    },
  });
}

async function processChatState(stateKey) {
  const state = chatScenario[stateKey];
  if (!state) return;

  const { messages, showStatus, options, requiresInput, autoNext, actionRedirect, action } = state;


  if (showStatus) {
    setTimeout(() => {
      displayStatus(true);
    }, 3000);
  } else {
    displayStatus(false);
  }

  let accumulatedDelay = 0;

  for (let index = 0; index < messages.length; index++) {
    await appendBotMessageWithDelay(messages[index], stateKey);

    if (index === messages.length - 1) {
      const phoneKeys = ['phone', 'questionFranchise']
      if (requiresInput) {
        if (phoneKeys.includes(stateKey.replace(/\d/g, ''))) {
          renderPhoneInputWithAI(stateKey, (phoneNumber) => {
            processChatState(state.next);
          });
        } else if (stateKey.includes("name")) {
          renderNameInput(stateKey, () => {});
        } else if (stateKey.includes("city")) {
          renderCityInputWithAI(stateKey, (userName) => {
            processChatState(state.next);
          });
        } else {
          renderTextInput(stateKey, (userInput) => {
            processChatState(state.next);
          });
        }
      } else if (options && options.length > 0) {
        renderOptions(stateKey, options);
      } else if (action) {
        action();
      }

      if (actionRedirect) {
        sendChatHistory();

        setTimeout(() => {
          window.location.href = 'thanks.html';
        }, 6000);
      }
    }
  }

  if (!options || options.length === 0) {
    setTimeout(() => {
      isBotBusy = false;
    }, accumulatedDelay + 1000);
  }
}

function getUTMData() {
  return {
    phone: '',
    email: '',
    name: '',
    city: '',
    question: '',
    timezone: (-1 * new Date().getTimezoneOffset()) / 60,
    utm_medium: $.query.get('utm_medium') || '',
    utm_placement: $.query.get('utm_placement') || '',
    utm_source: $.query.get('utm_source') || '',
    utm_term: $.query.get('utm_term') || '',
    utm_content: $.query.get('utm_content') || '',
    utm_campaign: $.query.get('utm_campaign') || '',
    utm_campaign_name: $.query.get('utm_campaign_name') || '',
    device_type: $.query.get('device_type') || '',
    utm_region_name: $.query.get('utm_region_name') || '',
    utm_placement: $.query.get('utm_placement') || '',
    utm_description: $.query.get('utm_description') || '',
    utm_device: $.query.get('utm_device') || '',
    page_url: window.location.href,
    user_location_ip: '',
    yclid: $.query.get('yclid') || '',
  };
}

function getPayload(history) {
  const payloadMap = {
    questionFranchise: 'phone',
  };

  function filterHistory(item) {
    return item.sender === "user";
  }

  function reduceHistory(acc, item) {
    if (!item.key || !item.message) {
      return acc;
    }

    const normalizedKey = item.key.replace(/\d+$/, "");
    const payloadKey = payloadMap[normalizedKey] || normalizedKey;

    return { ...acc, [payloadKey]: item.message };
  }

  const chatData = history.filter(filterHistory).reduce(reduceHistory, {});
  const payload = {
    ...getUTMData(),
    ...chatData,
  };

  console.log("Сформированные данные для отправки:", payload);
  return payload;
}

function sendChatHistory() {
  const payload = getPayload(chatHistory);
  const formData = createFormData(payload);
  // const dataToSend = JSON.stringify({ chatHistory });

  function createFormData(data) {
    var formData = new FormData()
  
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value)
      }
    })

    return formData
  }

  $.ajax({
    url: 'https://grand-smile-production.up.railway.app/formProcessor.php',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    dataType: 'json',
  });
}

function setCurrentYear() {
  $('[data-current-year]').text(new Date().getFullYear())
}

function initAnchorBtn() {
  $('[data-scroll-top]').on('click', function () {
    $('.modal-scrollable').animate(
      {
        scrollTop: 0,
      },
      1000,
    )
  })
}

document.addEventListener("DOMContentLoaded", () => {
  setInitialFeedbackStore();
  processChatState("start");

  setCurrentYear()
  initAnchorBtn()

  // === Chat input send logic ===
  const userInput = document.getElementById('userChatInput');
  const sendBtn = document.getElementById('userChatSendBtn');
  function handleUserSend() {
    const message = userInput.value.trim();
    if (!message) return;
    userInput.value = '';
    sendMessageToAI(message);
  }
  if (userInput && sendBtn) {
    sendBtn.addEventListener('click', handleUserSend);
    userInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserSend();
      }
    });
  }
  // === End chat input send logic ===

  // Автоматически инициируем диалог с ботом при загрузке страницы
  sendMessageToAI("__INIT__");
});

// Функция для рендера интерактивных элементов по модулю (например, стартовых вопросов)
function renderModuleOptions(key, options, callback) {
  clearOptions();

  const responseContainer = document.createElement("div");
  responseContainer.className = "response-options";

  options.forEach(({ label, value, next }) => {
    const button = document.createElement("button");
    button.type = 'button';
    button.innerHTML = label;
    button.onclick = () => {
      if (isBotBusy) return;
      clearOptions();
      if (key === 'startQuestions') {
        sendMessageToAI(label);
      } else if (callback) {
        callback(value, next);
      } else {
        processChatState(next);
      }
    };
    responseContainer.appendChild(button);
  });

  chatContent.appendChild(responseContainer);
  animateFadeIn(responseContainer);
  smoothScrollToBottom();
  lastOptions = responseContainer;
}

// Генерация и хранение sessionId
function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

const sessionId = getSessionId();

// Отправка сообщения пользователя и получение ответа от OpenAI backend
async function sendMessageToAI(userMessage) {
  if (userMessage === "__INIT__") {
    // Не отображаем и не отправляем в историю, только инициируем диалог с ботом
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'init', sessionId })
      });
      const data = await response.json();
      if (data.text) {
        await new Promise(resolve => setTimeout(resolve, 300));
        appendMessage({ text: data.text, isUser: false });
        isScenarioMode = false; // Успешное подключение к AI
        hideModeIndicator(); // Скрываем индикатор сценарного режима
      } else if (data.error) {
        console.log('Ошибка AI сервера, переключаемся на сценарный режим:', data.error);
        switchToScenarioMode();
      }
    } catch (e) {
      console.log('Ошибка соединения с AI сервером, переключаемся на сценарный режим:', e);
      switchToScenarioMode();
    }
    return;
  }
  
  if (!userMessage || !userMessage.trim()) return;
  appendMessage({ text: userMessage, isUser: true });
  
  // Если уже в сценарном режиме, обрабатываем через сценарий
  if (isScenarioMode) {
    handleScenarioModeMessage(userMessage);
    return;
  }
  
  // Тест: если пользователь отправляет одну из меток, бот возвращает её же
  const testTags = ['[ASK_CITY]', '[ASK_PHONE]', '[ASK_MESSENGER]', '[SHOW_MAGNET_OPTIONS]', '[PHOTO]'];
  if (testTags.some(tag => userMessage.includes(tag))) {
    appendMessage({ text: userMessage, isUser: false });
    return;
  }
  
  // Оригинальный код
  try {
    // Показываем индикатор печати перед отправкой запроса
    showTypingIndicatorManual();
    
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, sessionId })
    });
    const data = await response.json();
    if (data.text) {
      await new Promise(resolve => setTimeout(resolve, 300));
      appendMessage({ text: data.text, isUser: false });
      
      // Скрываем индикатор после полной обработки ответа
      // Используем setTimeout чтобы дать время на обработку интерактивных элементов
      setTimeout(() => {
        hideTypingIndicator();
      }, 600);
      
      // Если мы были в сценарном режиме, но получили ответ от AI, переключаемся обратно
      if (isScenarioMode) {
        isScenarioMode = false;
        hideModeIndicator();
      }
    } else if (data.error) {
      console.log('Ошибка AI сервера, переключаемся на сценарный режим:', data.error);
      appendMessage({ text: 'Переключаюсь на сценарный режим...', isUser: false });
      hideTypingIndicator();
      switchToScenarioMode();
      // Повторно обрабатываем сообщение в сценарном режиме
      setTimeout(() => {
        handleScenarioModeMessage(userMessage);
      }, 1000);
    }
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
}

// Функция переключения на сценарный режим
function switchToScenarioMode() {
  if (isScenarioMode) return; // Уже в сценарном режиме
  
  isScenarioMode = true;
  console.log('Переключение на сценарный режим');
  
  // Показываем индикатор режима
  showModeIndicator();
  
  // Показываем уведомление пользователю
  appendMessage({ 
    text: '🤖 Переключился на сценарный режим. Теперь я буду отвечать по заранее подготовленным сценариям. Выберите интересующий вас вопрос:', 
    isUser: false 
  });
  
  // Запускаем начальный сценарий
  setTimeout(() => {
    processChatState("start");
  }, 1500);
}

// Функция показа индикатора режима
function showModeIndicator() {
  const modeIndicator = document.getElementById('modeIndicator');
  if (modeIndicator) {
    modeIndicator.style.display = 'block';
  }
}

// Функция скрытия индикатора режима
function hideModeIndicator() {
  const modeIndicator = document.getElementById('modeIndicator');
  if (modeIndicator) {
    modeIndicator.style.display = 'none';
  }
}

// Функция обработки сообщений в сценарном режиме
function handleScenarioModeMessage(userMessage) {
  // Простая логика сопоставления сообщений с сценариями
  const message = userMessage.toLowerCase();
  
  // Проверяем, не хочет ли пользователь вернуться к AI режиму
  if (message.includes('ai') || message.includes('искусственный интеллект') || message.includes('чатгпт') || message.includes('chatgpt')) {
    appendMessage({ 
      text: 'Попробую снова подключиться к AI серверу...', 
      isUser: false 
    });
    // Пытаемся вернуться к AI режиму
    setTimeout(() => {
      sendMessageToAI("__INIT__");
    }, 1000);
    return;
  }
  
  // Более точное сопоставление ключевых слов
  if (message.includes('инвестиции') || message.includes('деньги') || message.includes('стоимость') || message.includes('сколько стоит') || message.includes('вложения')) {
    processChatState("investments");
  } else if (message.includes('прибыль') || message.includes('заработок') || message.includes('доход') || message.includes('сколько зарабатывают') || message.includes('выручка')) {
    processChatState("profit");
  } else if (message.includes('помощь') || message.includes('поддержка') || message.includes('сопровождение') || message.includes('как помогаете') || message.includes('что делаете')) {
    processChatState("help");
  } else if (message.includes('галерея') || message.includes('фото') || message.includes('магазин') || message.includes('как выглядят') || message.includes('примеры')) {
    processChatState("gallery");
  } else if (message.includes('отзывы') || message.includes('владельцы') || message.includes('партнеры') || message.includes('общение') || message.includes('встреча')) {
    processChatState("feedback");
  } else if (message.includes('компания') || message.includes('кто вы') || message.includes('сеть') || message.includes('о вас') || message.includes('расскажите')) {
    processChatState("aboutCompany");
  } else if (message.includes('вопрос') || message.includes('задать') || message.includes('интересует')) {
    processChatState("question");
  } else {
    // Если не можем определить сценарий, предлагаем варианты
    appendMessage({ 
      text: 'Я не совсем понял ваш вопрос. Выберите один из вариантов ниже или переформулируйте вопрос:', 
      isUser: false 
    });
    setTimeout(() => {
      processChatState("start");
    }, 1000);
  }
}

/**
 * Обновлённые обработчики для всех интерактивных элементов:
 * - Все пользовательские ответы отправляются в sendMessageToAI
 * - Если нет ответа от ИИ (или ошибка), fallback на processChatState(next)
 */

// --- AI-обёртки для интерактивных элементов с fallback ---
function renderYesNoOptionsWithAI(key, next) {
  renderYesNoOptions(key, (answer, key) => {
    sendMessageToAI(answer === 'yes' ? 'Да' : 'Нет', () => {
      if (next) processChatState(next[answer] ? next[answer] : next);
    });
  });
}

function renderCityInputWithAI(key, next) {
  renderCityInput(key, (userCity) => {
    sendMessageToAI(userCity, () => {
      if (next) processChatState(next);
    });
  });
}

function renderPhoneInputWithAI(key, next) {
  renderPhoneInput(key, (userPhone) => {
    // НЕ отправляем номер в sendMessageToAI!
    if (next) processChatState(next);
  });
}

function renderModuleOptionsWithAI(key, options, callback) {
  renderModuleOptions(key, options, (value, next) => {
    if (key === 'startQuestions') {
      sendMessageToAI(value, () => {
        if (next) processChatState(next);
      });
    } else if (key === 'messenger') {
      sendMessageToAI(value, () => {
        if (next) processChatState(next);
      });
    } else if (callback) {
      callback(value, next);
    } else if (next) {
      processChatState(next);
    }
  });
}

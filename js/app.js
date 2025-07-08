// Хранение данных
const chatHistory = [];

const chatContent = document.getElementById("chatContent");
const typingIndicator = document.getElementById("typingIndicator");
const typingPlaceholder = document.getElementById("typingPlaceholder");
const botNotificationSound = new Audio('audio/ringtone.mp3');
let lastOptions = null;
let isBotBusy = false;
let allowedScroll = false;
let botMessageCount = 0;
let swiperInstance = null;
let isProcessingBreak = false; // Флаг для отслеживания обработки [BREAK]
let isInteractiveVisible = false;

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
  // --- Исправление: обработка BREAK централизованно ---
  if (!isUser && typeof text === 'string' && text.includes('[BREAK]')) {
    appendBotMessageSmart({ value: text, type: 'text' }, key);
    return;
  }
  // Скрыть [END_CONVERSATION] для пользователя
  if (typeof text === 'string' && text.includes('[END_CONVERSATION]')) {
    const cleaned = text.replace(/\[END_CONVERSATION\]/g, '').trim();
    if (cleaned) {
      appendMessage({ text: cleaned, value, key, isUser, skipScroll });
    }
    return;
  }
  
  // === ДОБАВЛЯЕМ ВСЕ СООБЩЕНИЯ В CHATHISTORY ===
  if (text && typeof text === 'string') {
    chatHistory.push({ 
      sender: isUser ? "user" : "bot", 
      key: key, 
      message: text, 
      timestamp: new Date().toISOString() 
    });
  }
  
  // Парсер меток для интерактивных элементов
  if (!isUser && typeof text === 'string') {
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
      // Централизованная задержка через appendBotMessageWithDelay
      appendBotMessageWithDelay({ type: 'startQuestions' }, 'startQuestions');
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
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
      return;
    }
    // SHOW_YES_NO_OPTIONS
    if (text.includes('[SHOW_YES_NO_OPTIONS]')) {
      const parts = text.split('[SHOW_YES_NO_OPTIONS]');
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
      renderNameInputWithAI(key || 'name', (userName) => {});
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      return;
    }
  }

  // === ОБЫЧНОЕ ОТОБРАЖЕНИЕ СООБЩЕНИЙ ===
  const message = document.createElement("div");
  message.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  
  if (isUser) {
    message.innerHTML = `<p>${parseSpecialFormatting(text)}</p>`;
  } else {
    message.innerHTML = `<p>${parseSpecialFormatting(text)}</p>`;
  }
  
  chatContent.appendChild(message);
  animateFadeIn(message);
  
  // Звук только для сообщений бота
  if (!isUser) {
    botNotificationSound.play();
  }
  
  if (!skipScroll) smoothScrollToBottom();
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
        if (typingPlaceholder) typingPlaceholder.style.display = 'none';
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
            if (typingPlaceholder) typingPlaceholder.style.display = 'block';
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
    typingIndicator.style.display = 'none';
    if (typingPlaceholder) {
      typingPlaceholder.style.display = isInteractiveVisible ? 'none' : 'block';
    }
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
          if (typingPlaceholder) typingPlaceholder.style.display = 'none';
        }
      },
    });
  }
}

async function appendBotMessageWithDelay(message, key) {
  const delayMap = {
    'text':  Math.min(message.value?.length * 26 || 0, 3500), //сообщение без BREAK
    'swiper': 2000, //не используется
    'yesno': 1000, //не используется
    'startQuestions': 2000
  }

  isBotBusy = true;

  await showTypingIndicator(delayMap[message.type] || 0);
  await new Promise(resolve => setTimeout(resolve, 300));

  botNotificationSound.play();

  switch(message.type) {
    case 'text': //Сообщения с BREAK
      await appendBotMessageSmart(message, key); 
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
    case 'startQuestions':
      renderModuleOptionsWithAI('startQuestions', startQuestions);
      break;
  }

  isBotBusy = false;
}

function renderOptions(key, options) {
  hideTypingIndicator();
  isInteractiveVisible = true;
  if (typingPlaceholder) typingPlaceholder.style.display = 'none';

  clearOptions();

  const responseContainer = document.createElement("div");
  responseContainer.className = "response-options";

  options.forEach(({ label, value, next }, idx) => {
    const button = document.createElement("button");
    button.type = 'button';
    button.innerHTML = label;
    // Добавлять res-button- только для стартовых вопросов
    if (responseContainer.classList.contains('response-options-startQ')) {
      button.classList.add(`res-button-${idx + 1}`);
    }
    button.onclick = () => {
      if (isBotBusy) return;
      appendMessage({ text: label, value: value, key: key, isUser: true });

      // Проверяем и отправляем заявку если все данные собраны
      if (isUserDataComplete()) {
        sendChatApplicationWithHistory();
      }

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
  hideTypingIndicator();
  isInteractiveVisible = true;
  if (typingPlaceholder) typingPlaceholder.style.display = 'none';

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
  hideTypingIndicator();
  isInteractiveVisible = true;
  if (typingPlaceholder) typingPlaceholder.style.display = 'none';

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const form = document.createElement("form");
  form.className = "dynamic-form";
  form.style.flexDirection = "column";

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

  // === Контейнер для чекбокса и подписи ===
  // Новый flex-контейнер для двух блоков
  const agreeFlex = document.createElement("div");
  agreeFlex.className = "agree__flex";
  agreeFlex.style.display = "flex";
  agreeFlex.style.flexWrap = "wrap";
  agreeFlex.style.alignItems = "center";

  // Контейнер для чекбокса и текста
  const agreeMain = document.createElement("div");
  agreeMain.className = "agree__main";
  agreeMain.style.display = "flex";
  agreeMain.style.alignItems = "center";

  const agreeCheckbox = document.createElement("input");
  agreeCheckbox.type = "checkbox";
  agreeCheckbox.className = "agree";
  agreeCheckbox.id = "agree";
  agreeCheckbox.name = "agree";
  agreeCheckbox.style.marginRight = "8px";

  const agreeText = document.createElement("span");
  agreeText.textContent = "Я принимаю ";
  agreeText.style.color = "#303437";

  agreeMain.appendChild(agreeCheckbox);
  agreeMain.appendChild(agreeText);

  // Контейнер для ссылки
  const agreeLink = document.createElement("div");
  agreeLink.className = "agree__link";
  agreeLink.style.display = "flex";
  agreeLink.style.alignItems = "center";

  const privacyLink = document.createElement("a");
  privacyLink.href = "#";
  privacyLink.setAttribute("data-remodal-target", "privacy");
  privacyLink.textContent = "Политику конфиденциальности";
  privacyLink.style.textDecoration = "underline";
  privacyLink.style.color = "#303437";
  privacyLink.style.marginLeft = "4px";

  agreeLink.appendChild(privacyLink);

  // Собираем flex-контейнер
  agreeFlex.appendChild(agreeMain);
  agreeFlex.appendChild(agreeLink);

  // Label-обёртка для accessibility (можно оставить пустой или обернуть agreeFlex)
  const agreeLabel = document.createElement("label");
  agreeLabel.className = "agree__label tap-color";
  agreeLabel.style.display = "block";
  agreeLabel.style.cursor = "pointer";
  agreeLabel.appendChild(agreeFlex);

  // Сообщение об ошибке (скрыто по умолчанию)
  const agreeError = document.createElement("div");
  agreeError.id = "agree-error";
  agreeError.className = "error error--privacy";
  agreeError.setAttribute("for", "agree");
  agreeError.style.display = "none";
  agreeError.textContent = "Подтвердите согласие с политикой конфиденциальности";

  // Основной контейнер для блока согласия
  const agreeDiv = document.createElement("div");
  agreeDiv.className = "agree";
  agreeDiv.style.display = "flex";
  agreeDiv.style.flexDirection = "column";
  agreeDiv.style.marginTop = "12px";
  agreeDiv.style.fontSize = "14px";
  agreeDiv.appendChild(agreeLabel);
  agreeDiv.appendChild(agreeError);

  // === Контейнер для чекбокса и ошибки ===
  const formModalAgree = document.createElement("div");
  formModalAgree.className = "form-modal__agree";
  formModalAgree.appendChild(agreeDiv);

  // flex-контейнер для input и button
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group-flex";
  inputGroup.style.display = "flex";
  inputGroup.style.flexDirection = "row";
  inputGroup.style.flexWrap = "wrap";
  inputGroup.style.gap = "8px";
  inputGroup.style.alignItems = "center";
  inputGroup.appendChild(inputField);
  inputGroup.appendChild(submitButton);

  form.appendChild(inputGroup);
  form.appendChild(formModalAgree); // formModalAgree содержит .agree
  inputContainer.appendChild(form);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;

  // Блокируем отправку, если чекбокс не отмечен
  $(form).validate({
    errorPlacement: function () {},
    rules: {
      phone: {
        required: true,
        phone: true,
      },
      agree: {
        required: true
      }
    },
    messages: {
      agree: "Необходимо принять условия"
    },
    highlight: function(element, errorClass, validClass) {
      if (element.name === "agree") {
        agreeError.style.display = "block";
        inputField.classList.add("placeholder-error");
      }
    },
    unhighlight: function(element, errorClass, validClass) {
      if (element.name === "agree") {
        agreeError.style.display = "none";
        inputField.classList.remove("placeholder-error");
      }
    },
    submitHandler: function () {
      const phoneNumber = inputField.value.trim();
      inputContainer.remove();
      appendMessage({ text: phoneNumber, key: key, isUser: true });
      
      // Проверяем и отправляем заявку если все данные собраны
      if (isUserDataComplete()) {
        sendChatApplicationWithHistory();
      }
      
      // Переходим к следующему шагу сценария
      if (callback) callback(phoneNumber);
      const state = chatScenario[key];
      if (state && state.next) processChatState(state.next);
    },
  });

  // Скрывать ошибку при клике на чекбокс
  agreeCheckbox.addEventListener("change", function() {
    if (agreeCheckbox.checked) {
      agreeError.style.display = "none";
      inputField.classList.remove("placeholder-error");
    }
  });
}

function renderCityInput(key, callback) {
  hideTypingIndicator();
  isInteractiveVisible = true;
  if (typingPlaceholder) typingPlaceholder.style.display = 'none';

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
      appendMessage({ text: userCity, key: key, isUser: true });
      
      // Проверяем и отправляем заявку если все данные собраны
      if (isUserDataComplete()) {
        sendChatApplicationWithHistory();
      }
      
      if (callback) callback(userCity);
    },
  });
}

function renderNameInput(key, callback) {
  hideTypingIndicator();
  isInteractiveVisible = true;
  if (typingPlaceholder) typingPlaceholder.style.display = 'none';

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

  //помещаем поле ввода имени и кнопку во flex контейнер
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group-flex";
  inputGroup.style.display = "flex";
  inputGroup.style.flexDirection = "row";
  inputGroup.style.flexWrap = "wrap";
  inputGroup.style.gap = "8px";
  inputGroup.style.alignItems = "center";

  inputGroup.appendChild(inputField);
  inputGroup.appendChild(submitButton);

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
      // Проверяем и отправляем заявку если все данные собраны
      if (isUserDataComplete()) {
        sendChatApplicationWithHistory();
      }
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

// Функция для сбора данных пользователя из чата
function collectUserData() {
  const payload = getPayload(chatHistory);
  
  return {
    name: payload.name || '',
    phone: payload.phone || '',
    messenger: payload.messenger || '',
    city: payload.city || ''
  };
}

// Функция для проверки полноты данных
function isUserDataComplete() {
  const userData = collectUserData();
  return userData.name && userData.phone && userData.messenger;
}

// === В НАЧАЛО ФАЙЛА ===
window._chatApplicationSent = false;

// Функция для отправки заявки с историей чата
function sendChatApplicationWithHistory() {
  if (window._chatApplicationSent) return;
  if (!isUserDataComplete()) return;
  window._chatApplicationSent = true;

  const userData = collectUserData();
  const chatText = getChatHistoryText();

  // Формируем данные для отправки (отправляем историю как отдельное поле)
  const payload = {
    ...userData,
    chat_history: chatText
  };

  $.ajax({
    url: (window.API_BASE_URL || 'https://zoological-expression-production.up.railway.app') + '/api/send_contact.php',
    type: 'POST',
    data: JSON.stringify(payload),
    contentType: 'application/json',
    dataType: 'json',
    success: function(response) {
      if (response.success) {
        console.log('Заявка с историей чата успешно отправлена:', payload);
      } else {
        console.error('Ошибка отправки заявки с историей чата:', response.message);
      }
    },
    error: function(xhr, status, error) {
      console.error('Ошибка отправки заявки с историей чата:', error);
    }
  });
}

function setCurrentYear() {
  $('[data-current-year]').text(new Date().getFullYear())
}

document.addEventListener("DOMContentLoaded", () => {
  window._chatApplicationSent = false;
  setInitialFeedbackStore();
  processChatState("start");

  setCurrentYear()
  initAnchorBtn()

  // === Chat input send logic ===
  const userInput = document.getElementById('userChatInput');
  const sendBtn = document.getElementById('userChatSendBtn');
  function sendUserMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage({ text, isUser: true });
    userInput.value = '';
  }
  if (userInput && sendBtn) {
    sendBtn.addEventListener('click', sendUserMessage);
    userInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
  }
  // === End chat input send logic ===

  // Автоматически инициируем диалог с ботом при загрузке страницы
  sendMessageToAI("__INIT__");
});

// Функция для рендера интерактивных элементов по модулю (например, стартовых вопросов)
function renderModuleOptions(key, options, callback) {
  hideTypingIndicator();
  isInteractiveVisible = true;
  if (typingPlaceholder) typingPlaceholder.style.display = 'none';

  clearOptions();

  const responseContainer = document.createElement("div");
  // Добавляем нужный класс контейнеру в зависимости от типа опций
  if (key === 'startQuestions') {
    responseContainer.className = "response-options-startQ";
  } else {
    responseContainer.className = "response-options";
  }

  options.forEach(({ label, value, next }, idx) => {
    const button = document.createElement("button");
    button.type = 'button';
    button.innerHTML = label;
    // Добавлять res-button- только для стартовых вопросов
    if (responseContainer.classList.contains('response-options-startQ')) {
      button.classList.add(`res-button-${idx + 1}`);
    }
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
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

const sessionId = getSessionId();

// Отправка сообщения пользователя и получение ответа от OpenAI backend
async function sendMessageToAI(userMessage, cb, keyOverride) {
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
      } else if (data.error) {
        appendMessage({ text: 'Ошибка: ' + data.error, isUser: false });
      }
    } catch (e) {
      appendMessage({ text: 'Ошибка соединения с сервером.', isUser: false });
    }
    return;
  }
  if (!userMessage || !userMessage.trim()) return;
  appendMessage({ text: userMessage, key: keyOverride, isUser: true });
  // Тест: если пользователь отправляет одну из меток, бот возвращает её же
  const testTags = ['[ASK_CITY]', '[ASK_PHONE]', '[ASK_MESSENGER]', '[SHOW_YES_NO_OPTIONS]', '[PHOTO]'];
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
      if (data.text.includes('[BREAK]')) {
        await appendBotMessageSmart({ value: data.text, type: 'text' }, undefined);
        hideTypingIndicator();
      } else {
        appendMessage({ text: data.text, isUser: false });
        hideTypingIndicator();
      }
    } else if (data.error) {
      appendMessage({ text: 'Ошибка: ' + data.error, isUser: false });
      hideTypingIndicator();
    }
  } catch (e) {
    appendMessage({ text: 'Ошибка соединения с сервером.', isUser: false });
    hideTypingIndicator();
  }
}

// Перехват отправки сообщения пользователем (Enter или кнопка)
const userInput = document.getElementById('userChatInput');
const sendBtn = document.getElementById('userChatSendBtn');

function handleUserSend() {
  const message = userInput.value.trim();
  if (!message) return;
  userInput.value = '';
  sendMessageToAI(message);
}

userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleUserSend();
  }
});
sendBtn.addEventListener('click', handleUserSend);

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
      // Только sendMessageToAI, без appendMessage вручную
      sendMessageToAI(value, () => {
        if (next) processChatState(next);
      }, 'messenger');
    } else if (callback) {
      callback(value, next);
    } else if (next) {
      processChatState(next);
    }
  });
}

// Универсальная функция задержки и показа индикатора печати
async function showTypingWithDelay(text) {
  const delay = Math.min(text.length * 24, 3500);
  await showTypingIndicator(delay);
  await new Promise(resolve => setTimeout(resolve, 300));
}

// Универсальная функция вывода сообщений с поддержкой BREAK
async function appendBotMessageSmart(message, key) {
  if (message.value && message.value.includes('[BREAK]')) {
    const parts = message.value.split('[BREAK]').map(p => p.trim()).filter(Boolean);
    for (let part of parts) {
      await showTypingWithDelay(part);
      appendMessage({ text: part, key: key });
    }
    hideTypingIndicator();
  } else {
    await showTypingWithDelay(message.value);
    appendMessage({ text: message.value, key: key });
    hideTypingIndicator();
  }
}

// Функция для формирования истории чата в виде текста
function getChatHistoryText() {
  return chatHistory
    .map(item => {
      const sender = item.sender === 'user' ? 'Пользователь' : 'Бот';
      const msg = item.message || item.text || '';
      return `${sender}: ${msg}`;
    })
    .join('\n');
}

<?php

function set_cors_headers() {
    header("Access-Control-Allow-Origin: https://bot.lp-chat.ru");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Max-Age: 86400");
    header("Content-Type: application/json; charset=UTF-8");
}

set_cors_headers();

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    set_cors_headers();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Получаем данные из POST запроса
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Валидация данных
$required_fields = ['name', 'phone'];
$errors = [];
foreach ($required_fields as $field) {
  if (empty($input[$field])) {
    $errors[] = "Поле '$field' обязательно для заполнения";
  }
}
if (!empty($errors)) {
    set_cors_headers();
    http_response_code(400);
    echo json_encode(['error' => 'Validation failed', 'details' => $errors]);
    exit();
}

// Устанавливаем часовой пояс
date_default_timezone_set('Europe/Moscow');

// Настройки вашей почты
$mail = new PHPMailer(true);
try {
    // SMTP настройки
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'idrisovamir21tr@gmail.com';
    $mail->Password = 'fhkf qfxp ckxn bokv';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    // От кого и кому
    $mail->setFrom('idrisovamir21tr@gmail.com', 'LP Chat');
    $mail->addAddress('idrisovamir21tr@gmail.com');

    // Тема и тело письма
    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка';
    
    $body = '<b>Имя:</b> ' . htmlspecialchars($input['name']) . '<br>' .
        '<b>Телефон:</b> ' . htmlspecialchars($input['phone']) . '<br>';
    
    // Добавляем мессенджер если есть
    if (!empty($input['messenger'])) {
        $body .= '<b>Мессенджер:</b> ' . htmlspecialchars($input['messenger']) . '<br>';
    }
    
    // Добавляем город если есть
    if (!empty($input['city'])) {
        $body .= '<b>Город:</b> ' . htmlspecialchars($input['city']) . '<br>';
    }
    
    $body .= '<b>Дата:</b> ' . date('d-m-Y H:i:s');
    
    // Прикрепляем историю чата, если есть
    $chatHistoryFile = null;
    if (!empty($input['chat_history'])) {
        $chatHistoryFile = tempnam(sys_get_temp_dir(), 'chat_history_') . '.txt';
        file_put_contents($chatHistoryFile, $input['chat_history']);
        $mail->addAttachment($chatHistoryFile, 'chat_history.txt');
    }
    
    $mail->Body = $body;

    $mail->send();
    // Удаляем временный файл истории чата
    if ($chatHistoryFile && file_exists($chatHistoryFile)) {
        unlink($chatHistoryFile);
    }
    set_cors_headers();
    echo json_encode(['success' => true, 'message' => 'Заявка успешно отправлена!']);
    exit();
} catch (Exception $e) {
    set_cors_headers();
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка отправки', 'message' => $mail->ErrorInfo]);
    exit();
} 
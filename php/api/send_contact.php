<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    $mail->Subject = 'Новая заявка bot.lp-chat.ru';
    
    // --- Группировка и форматирование как в formProcessor.php ---
    $fields = [
        'name' => ['Имя отправителя', 'Name', $input['name'] ?? ''],
        'phone' => ['Номер телефона', 'Phone', $input['phone'] ?? ''],
        'email' => ['Email', 'Email', $input['email'] ?? ''],
        'city' => ['Город', 'City', $input['city'] ?? ''],
        'question' => ['Вопрос', 'Question', $input['question'] ?? ''],
        'messenger' => ['Мессенджер', 'Messenger', $input['messenger'] ?? ''],
        'chat_history' => ['История чата', 'Chat history', $input['chat_history'] ?? ''],
        // UTM и рекламные
        'utm_source' => ['Источник трафика', 'utm_source', $input['utm_source'] ?? ''],
        'utm_medium' => ['Тип рекламы', 'utm_medium', $input['utm_medium'] ?? ''],
        'utm_campaign' => ['Номер рекламной кампании', 'utm_campaign', $input['utm_campaign'] ?? ''],
        'utm_content' => ['Контент кампании', 'utm_content', $input['utm_content'] ?? ''],
        'utm_term' => ['Ключевое слово', 'utm_term', $input['utm_term'] ?? ''],
        'utm_device' => ['Тип устройства', 'utm_device', $input['utm_device'] ?? ''],
        'utm_campaign_name' => ['Название рекламного кабинета', 'utm_campaign_name', $input['utm_campaign_name'] ?? ''],
        'utm_placement' => ['Место показа', 'utm_placement', $input['utm_placement'] ?? ''],
        'utm_description' => ['Текст рекламного объявления', 'utm_description', $input['utm_description'] ?? ''],
        'utm_region_name' => ['Регион', 'utm_region_name', $input['utm_region_name'] ?? ''],
        'device_type' => ['Тип устройства (доп.)', 'device_type', $input['device_type'] ?? ''],
        'yclid' => ['Яндекс Клик ID', 'yclid', $input['yclid'] ?? ''],
        'page_url' => ['URL страницы', 'page_url', $input['page_url'] ?? ''],
        'user_location_ip' => ['IP/Гео пользователя', 'user_location_ip', $input['user_location_ip'] ?? ''],
        // Кастомные
        'section-btn-text' => ['Текст на кнопке', 'Answertext', $input['section-btn-text'] ?? ''],
        'section-name-text' => ['Заголовок на экране, с которого оставлена заявка', 'Section-name-text', $input['section-name-text'] ?? ''],
        'section-name' => ['Тип формы', 'Section-name', $input['section-name'] ?? ''],
    ];

    $groups = [
        'Информация, указанная посетителем сайта:' => [
            'fields' => ['name', 'phone', 'email', 'city', 'question', 'messenger'],
            'html' => ''
        ],
        'Информация из рекламной системы:' => [
            'fields' => ['page_url', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_device', 'utm_campaign_name', 'utm_placement', 'utm_description', 'utm_region_name', 'device_type', 'yclid', 'user_location_ip'],
            'html' => ''
        ],
        'Кастомная информация:' => [
            'fields' => ['section-btn-text', 'section-name-text', 'section-name'],
            'html' => ''
        ],
    ];

    foreach ($fields as $key => $val) {
        if (empty($val[2])) continue;
        foreach ($groups as $groupName => &$group) {
            if (in_array($key, $group['fields'])) {
                $group['html'] .= '<p style="margin:0;"><strong>' . $val[0] . ':</strong> ' . htmlspecialchars($val[2]) . '</p>' . "\r\n";
            }
        }
    }
    unset($group);

    $body = "<html><body style='font-family:Arial,sans-serif;'>";
    $body .= "<h2>Вам поступила новая заявка с сайта bot.lp-chat.ru</h2>\r\n";
    $body .= '<b>Дата:</b> ' . date('d-m-Y H:i:s') . '<br>';
    foreach ($groups as $sectionTitle => $value) {
        if (empty($value['html'])) continue;
        $body .= '<h3 style="font-size: 15px; font-weight: normal; font-style: italic;">' . $sectionTitle . '</h3>';
        $body .= $value['html'];
    }
    $body .= "<p style='font-style: italic; padding: 10px 0 0 0;'>Свяжитесь с потенциальным клиентом в течение 15 минут!</p>";
    $body .= "</body></html>";

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
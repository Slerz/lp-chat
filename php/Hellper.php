<?php
$path = dirname(__FILE__);
require $path . '/PHPMailer/src/Exception.php';
require $path . '/PHPMailer/src/PHPMailer.php';
require $path . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;



function mailer($sendto, $subject, $htmlBody, $headers = false)
{
    try {
        $phpmailer = new PHPMailer();

        // Включаем SMTP для Gmail
        $phpmailer->isSMTP();
        $phpmailer->Host = 'smtp.gmail.com';
        $phpmailer->SMTPAuth = true;
        $phpmailer->Port = 465;
        $phpmailer->SMTPSecure = 'ssl';
        $phpmailer->Username = getenv('GMAIL_USER') ?: 'idrisovamir21tr@gmail.com'; // ваш Gmail
        $phpmailer->Password = getenv('GMAIL_PASS') ?: 'fhkf qfxp ckxn bokv'; // пароль приложения Gmail

        $phpmailer->setFrom(SND_FROM ?: 'idrisovamir21tr@gmail.com', SND_NAME ?: 'Shefport Chatbot');

        $addresses = explode(",", $sendto);
        foreach ($addresses as $address) {
            $phpmailer->addAddress(trim($address));
        }

        $phpmailer->addReplyTo(SND_FROM ?: 'idrisovamir21tr@gmail.com', SND_NAME ?: 'Shefport Chatbot');

        $phpmailer->isHTML(true);
        $phpmailer->Subject = $subject;
        $phpmailer->Body    = $htmlBody;
        $phpmailer->CharSet = "UTF-8";
        $phpmailer->AltBody = str_replace(array("<br>", "<br/>", "<BR>", "<BR/>"), "\r\n", strip_tags($htmlBody, "<br>"));
        $phpmailer->send();
        return true;
    } catch (Exception $e) {
        error_log('Mailer Error: ' . $phpmailer->ErrorInfo);
        return false;
    }
}



function fileContentsToVar($file, $data)
{
    extract($data);
    ob_start();
    require($file);
    return ob_get_clean();
}

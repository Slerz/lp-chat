<?php

namespace App;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Mailer
{
    private $mailer;
    private $config;

    public function __construct($config = [])
    {
        $this->config = array_merge([
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'username' => '',
            'password' => '',
            'encryption' => 'tls',
            'from_email' => '',
            'from_name' => 'LP Chat'
        ], $config);

        $this->mailer = new PHPMailer(true);
        $this->setupMailer();
    }

    private function setupMailer()
    {
        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['username'];
            $this->mailer->Password = $this->config['password'];
            $this->mailer->SMTPSecure = $this->config['encryption'];
            $this->mailer->Port = $this->config['port'];
            $this->mailer->CharSet = 'UTF-8';

            // Default sender
            $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);

        } catch (Exception $e) {
            throw new \Exception("Mailer setup failed: {$e->getMessage()}");
        }
    }

    public function sendEmail($to, $subject, $body, $isHTML = true, $attachments = [])
    {
        try {
            // Recipients
            if (is_array($to)) {
                foreach ($to as $email => $name) {
                    if (is_numeric($email)) {
                        $this->mailer->addAddress($name);
                    } else {
                        $this->mailer->addAddress($email, $name);
                    }
                }
            } else {
                $this->mailer->addAddress($to);
            }

            // Content
            $this->mailer->isHTML($isHTML);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $body;

            if (!$isHTML) {
                $this->mailer->AltBody = strip_tags($body);
            }

            // Attachments
            if (!empty($attachments)) {
                foreach ($attachments as $attachment) {
                    if (is_array($attachment)) {
                        $this->mailer->addAttachment($attachment['path'], $attachment['name'] ?? '');
                    } else {
                        $this->mailer->addAttachment($attachment);
                    }
                }
            }

            $this->mailer->send();
            return true;

        } catch (Exception $e) {
            throw new \Exception("Email sending failed: {$e->getMessage()}");
        }
    }

    public function sendContactForm($data)
    {
        $subject = 'Новое сообщение с сайта LP Chat';
        
        $body = "
        <html>
        <head>
            <title>Новое сообщение</title>
        </head>
        <body>
            <h2>Новое сообщение с сайта LP Chat</h2>
            <table>
                <tr><td><strong>Имя:</strong></td><td>{$data['name']}</td></tr>
                <tr><td><strong>Телефон:</strong></td><td>{$data['phone']}</td></tr>
                <tr><td><strong>Город:</strong></td><td>{$data['city']}</td></tr>
                <tr><td><strong>Вопрос:</strong></td><td>{$data['question']}</td></tr>
                <tr><td><strong>Дата:</strong></td><td>" . date('Y-m-d H:i:s') . "</td></tr>
            </table>
        </body>
        </html>";

        return $this->sendEmail($this->config['from_email'], $subject, $body);
    }

    public function sendNotification($to, $subject, $message)
    {
        $body = "
        <html>
        <head>
            <title>{$subject}</title>
        </head>
        <body>
            <h2>{$subject}</h2>
            <p>{$message}</p>
            <hr>
            <p><small>Отправлено с сайта LP Chat</small></p>
        </body>
        </html>";

        return $this->sendEmail($to, $subject, $body);
    }
} 
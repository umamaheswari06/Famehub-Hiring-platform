package com.hiring.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@hiringplatform.com}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String contentHtml) {
        log.info("Preparing to send email to {} with subject: {}", to, subject);
        
        if (mailSender == null) {
            log.warn("SMTP Mail Sender is disabled. Printing email body to console:\nTo: {}\nSubject: {}\nBody: {}", to, subject, contentHtml);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, 
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, 
                    StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(contentHtml, true); // Set HTML payload to true

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}

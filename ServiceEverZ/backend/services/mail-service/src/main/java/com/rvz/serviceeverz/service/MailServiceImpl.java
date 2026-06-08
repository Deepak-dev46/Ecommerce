package com.rvz.serviceeverz.service;
 
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.dto.BulkMailRequest;
import com.rvz.serviceeverz.dto.MailRequest;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
 
@Service
public class MailServiceImpl implements MailService {
 
    private static final Logger log = LoggerFactory.getLogger(MailServiceImpl.class);
 
    private final JavaMailSender mailSender;
 
    // Centralized sender — always muthubro03@gmail.com
    // To switch to company email later: change only spring.mail.username in application.properties
    @Value("${spring.mail.username}")
    private String fromEmail;
 
    public MailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
 
    @Override
    public String sendEmail(MailRequest request) {
        log.info("Processing email — from={}, to={}, subject={}",
                fromEmail, request.getTo(), request.getSubject());
        if (request.isHtmlBody()) {
            return sendHtmlEmail(request);
        } else {
            return sendPlainTextEmail(request);
        }
    }
 
    private String sendHtmlEmail(MailRequest request) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);           // centralized sender
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(request.getBody(), true); // true = render as HTML
            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", request.getTo());
            return "HTML Email delivered to " + request.getTo();
        } catch (MessagingException | MailException ex) {
            log.error("Failed to send HTML email to {}: {}", request.getTo(), ex.getMessage());
            throw new RuntimeException("HTML Email delivery failed: " + ex.getMessage(), ex);
        }
    }
 
    private String sendPlainTextEmail(MailRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);          // centralized sender
            message.setTo(request.getTo());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());
            mailSender.send(message);
            log.info("Plain-text email sent successfully to: {}", request.getTo());
            return "Email delivered to " + request.getTo();
        } catch (MailException ex) {
            log.error("Failed to send plain email to {}: {}", request.getTo(), ex.getMessage());
            throw new RuntimeException("Email delivery failed: " + ex.getMessage(), ex);
        }
    }
    
    @Override
    public String sendBulkEmail(BulkMailRequest request) {
        log.info("Bulk mail — recipients={}, subject={}", request.getRecipients().size(), request.getSubject());
     
        if (request.getRecipients() == null || request.getRecipients().isEmpty()) {
            throw new RuntimeException("No recipients provided");
        }
     
        List<MimeMessage> messages = new ArrayList<>();
     
        for (String to : request.getRecipients()) {
            if (to == null || to.isBlank()) continue;
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(request.getSubject());
                if (request.isHtmlBody()) {
                    helper.setText(request.getBody(), true);
                } else {
                    helper.setText(request.getBody(), false);
                }
                messages.add(mimeMessage);
            } catch (MessagingException ex) {
                log.error("Failed to build message for {}: {}", to, ex.getMessage());
            }
        }
     
        if (messages.isEmpty()) throw new RuntimeException("No valid messages to send");
     
        // Single SMTP connection — sends all in one session
        mailSender.send(messages.toArray(new MimeMessage[0]));
     
        log.info("Bulk email sent to {} recipients", messages.size());
        return "Bulk email delivered to " + messages.size() + " recipients";
    }
}
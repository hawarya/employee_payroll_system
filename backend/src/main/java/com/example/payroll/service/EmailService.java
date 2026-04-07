package com.example.payroll.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendResetPasswordEmail(String email, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request - Employee Payroll System");
        message.setText("Click the following link to reset your password:\n\n" + resetUrl + "\n\nIf you did not request this, please ignore this email.");
        
        try {
            System.out.println("DEBUG: Reset Link for " + email + " is: " + resetUrl);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send email to " + email + ": " + e.getMessage());
            throw new RuntimeException("Email sending failed: " + e.getMessage());
        }
    }
}

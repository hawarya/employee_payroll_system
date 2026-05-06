package com.example.payroll.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send OTP email for login or password reset.
     * Called by EmailEventListener (event-driven).
     */
    public void sendOtpEmail(String email, String otp, String subject, String purposeText) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject(subject);
        message.setText(String.format(
            "Dear User,\n\n" +
            "Your One-Time Password (OTP) to %s is:\n\n" +
            "    %s\n\n" +
            "This OTP is valid for 10 minutes. Do not share it with anyone.\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Regards,\n" +
            "Employee Payroll System (PayMatrix)",
            purposeText, otp
        ));

        try {
            System.out.println("DEBUG: Sending OTP email to " + email + " from " + fromEmail);
            mailSender.send(message);
            System.out.println("DEBUG: OTP email sent successfully to " + email);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send OTP email to " + email + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendLeaveApplicationEmail(String adminEmail, String employeeName, String startDate, String endDate, String type) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(adminEmail);
        message.setSubject("New Leave Application: " + employeeName);
        message.setText(String.format(
            "Hello Admin,\n\n" +
            "A new leave application has been submitted by %s.\n\n" +
            "Details:\n" +
            "- Leave Type: %s\n" +
            "- Start Date: %s\n" +
            "- End Date: %s\n\n" +
            "Please log in to the portal to review this request.\n\n" +
            "Regards,\n" +
            "Employee Payroll System",
            employeeName, type, startDate, endDate
        ));

        try {
            System.out.println("DEBUG: Sending Leave Application Email to Admin: " + adminEmail);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send leave application email to " + adminEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendLeaveStatusUpdateEmail(String employeeEmail, String status, String startDate, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(employeeEmail);
        message.setSubject("Leave Request Update - " + status);
        
        StringBuilder body = new StringBuilder();
        body.append(String.format("Dear Employee,\n\nYour leave request starting on %s has been %s.\n", startDate, status));
        
        if (reason != null && !reason.isBlank()) {
            body.append("\nRemark/Reason: ").append(reason).append("\n");
        }
        
        body.append("\nRegards,\nEmployee Payroll System");
        message.setText(body.toString());

        try {
            System.out.println("DEBUG: Sending Leave Status Email to Employee: " + employeeEmail);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send leave status email to " + employeeEmail + ": " + e.getMessage());
        }
    }
}

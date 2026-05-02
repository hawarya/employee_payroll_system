package com.example.payroll.events;

import com.example.payroll.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class EmailEventListener {

    @Autowired
    private EmailService emailService;

    @Async
    @EventListener
    public void handleOtpEmailEvent(OtpEmailEvent event) {
        String subject;
        String purposeText;

        if (event.getPurpose() == OtpPurpose.LOGIN) {
            subject = "Login OTP - Employee Payroll System";
            purposeText = "log in to your account";
        } else {
            subject = "Password Reset OTP - Employee Payroll System";
            purposeText = "reset your password";
        }

        emailService.sendOtpEmail(event.getEmail(), event.getOtp(), subject, purposeText);
    }
}

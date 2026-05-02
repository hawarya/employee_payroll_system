package com.example.payroll.service;

import com.example.payroll.events.OtpEmailEvent;
import com.example.payroll.events.OtpPurpose;
import com.example.payroll.models.Otp;
import com.example.payroll.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Value("${otp.expiry.minutes:10}")
    private int otpExpiryMinutes;

    @Value("${otp.max.attempts:3}")
    private int maxAttempts;

    private final SecureRandom random = new SecureRandom();

    /**
     * Generate a 6-digit OTP, store it, and publish an event to send it via email.
     */
    public void generateAndSendOtp(String email, OtpPurpose purpose) {
        // Clear any existing unused OTPs for this email
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", random.nextInt(999999));

        // Save OTP with expiry
        Otp otp = new Otp(email, otpCode, otpExpiryMinutes, purpose.name());
        otpRepository.save(otp);

        System.out.println("DEBUG: Generated OTP for " + email + " -> " + otpCode + " (purpose: " + purpose + ")");

        // Publish event to send email (event-driven)
        eventPublisher.publishEvent(new OtpEmailEvent(this, email, otpCode, purpose));
    }

    /**
     * Verify the OTP for a given email.
     * Enforces: expiry check, retry limit (3 attempts), and no-reuse policy.
     */
    public OtpVerificationResult verifyOtp(String email, String otpCode) {
        Optional<Otp> otpOpt = otpRepository.findByEmailAndUsedFalse(email);

        if (otpOpt.isEmpty()) {
            return new OtpVerificationResult(false, "No active OTP found. Please request a new one.");
        }

        Otp otp = otpOpt.get();

        // Check if expired
        if (otp.isExpired()) {
            otpRepository.delete(otp);
            return new OtpVerificationResult(false, "OTP has expired. Please request a new one.");
        }

        // Check retry limit
        if (otp.isMaxAttemptsReached()) {
            otpRepository.delete(otp);
            return new OtpVerificationResult(false, "Maximum verification attempts exceeded. Please request a new OTP.");
        }

        // Increment attempt count
        otp.setAttemptCount(otp.getAttemptCount() + 1);
        otpRepository.save(otp);

        // Verify OTP
        if (!otp.getOtp().equals(otpCode)) {
            int remaining = maxAttempts - otp.getAttemptCount();
            return new OtpVerificationResult(false, 
                "Invalid OTP. " + (remaining > 0 ? remaining + " attempt(s) remaining." : "No attempts remaining."));
        }

        // Mark as used (prevent reuse)
        otp.setUsed(true);
        otpRepository.save(otp);

        return new OtpVerificationResult(true, "OTP verified successfully.");
    }

    /**
     * Simple result wrapper for OTP verification.
     */
    public record OtpVerificationResult(boolean success, String message) {}
}

package com.example.payroll.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "otps")
public class Otp {
    @Id
    private String id;

    private String email;
    private String otp;
    private LocalDateTime expiryTime;
    private int attemptCount = 0;
    private boolean used = false;
    private String purpose; // LOGIN or PASSWORD_RESET

    public Otp() {}

    public Otp(String email, String otp, int expiryMinutes, String purpose) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = LocalDateTime.now().plusMinutes(expiryMinutes);
        this.attemptCount = 0;
        this.used = false;
        this.purpose = purpose;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }

    public boolean isMaxAttemptsReached() {
        return attemptCount >= 3;
    }
}

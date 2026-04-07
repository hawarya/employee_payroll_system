package com.example.payroll.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    private String id;
    
    private String token;
    private String employeeId;
    private LocalDateTime expiryDate;

    public PasswordResetToken() {}

    public PasswordResetToken(String token, String employeeId, int expiryMinutes) {
        this.token = token;
        this.employeeId = employeeId;
        this.expiryDate = LocalDateTime.now().plusMinutes(expiryMinutes);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}

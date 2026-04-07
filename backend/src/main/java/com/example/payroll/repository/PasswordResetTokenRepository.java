package com.example.payroll.repository;

import com.example.payroll.models.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByEmployeeId(String employeeId);
}

package com.example.payroll.repository;

import com.example.payroll.models.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OtpRepository extends MongoRepository<Otp, String> {
    Optional<Otp> findByEmailAndUsedFalse(String email);
    void deleteByEmail(String email);
}

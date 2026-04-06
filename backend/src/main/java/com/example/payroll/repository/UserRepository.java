package com.example.payroll.repository;

import com.example.payroll.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmployeeId(String employeeId);
    Boolean existsByEmployeeId(String employeeId);
}

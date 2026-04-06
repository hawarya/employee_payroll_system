package com.example.payroll.repository;

import com.example.payroll.models.LeaveBalance;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LeaveBalanceRepository extends MongoRepository<LeaveBalance, String> {
    Optional<LeaveBalance> findByEmployeeId(String employeeId);
}

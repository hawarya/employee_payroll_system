package com.example.payroll.repository;

import com.example.payroll.models.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface EmployeeRepository extends MongoRepository<Employee, String> {
    Page<Employee> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Employee> findByEmployeeId(String employeeId);
}

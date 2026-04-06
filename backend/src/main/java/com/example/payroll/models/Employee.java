package com.example.payroll.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "employees")
public class Employee {
    @Id
    private String id;
    
    private String employeeId;
    private String name;
    private String email;
    private String department;
    private String designation;
    
    private EmployeeType type;
    
    // Financial Fields (Using Double for simplicity, consider BigDecimal for precision in production)
    private Double baseSalary;      // For FULL_TIME
    private Double hourlyRate;      // For PART_TIME
    private Double contractAmount;  // For CONTRACT
    
    private Double bonus = 0.0;
    private Double taxDeduction = 0.0;
    private Double pfDeduction = 0.0;
    
    private Double hoursWorked = 0.0; // For PART_TIME
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

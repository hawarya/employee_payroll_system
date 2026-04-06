package com.example.payroll.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "leave_balances")
public class LeaveBalance {
    @Id
    private String id;

    private String employeeId;

    private int sickLeaves = 10;
    private int casualLeaves = 10;
    private int earnedLeaves = 10;

    private int usedSick = 0;
    private int usedCasual = 0;
    private int usedEarned = 0;
}

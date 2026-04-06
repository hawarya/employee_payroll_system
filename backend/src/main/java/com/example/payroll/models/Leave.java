package com.example.payroll.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "leaves")
public class Leave {
    @Id
    private String id;

    private String employeeId;
    private String employeeName;

    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;

    private String reason;
    private LeaveStatus status = LeaveStatus.PENDING;

    private LocalDateTime appliedOn = LocalDateTime.now();
    private String reviewedBy;
    private LocalDateTime reviewedOn;
    private String rejectionReason;

    public enum LeaveType {
        SICK, CASUAL, EARNED
    }

    public enum LeaveStatus {
        PENDING, APPROVED, REJECTED
    }
}

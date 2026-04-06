package com.example.payroll.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "attendance")
public class Attendance {
    @Id
    private String id;

    private String employeeId;      // references User.employeeId
    private String employeeName;

    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    private Double hoursWorked = 0.0;
    private Double overtimeHours = 0.0;

    private AttendanceStatus status = AttendanceStatus.PRESENT;

    public enum AttendanceStatus {
        PRESENT, ABSENT, HALF_DAY, ON_LEAVE
    }
}

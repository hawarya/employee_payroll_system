package com.example.payroll.service;

import com.example.payroll.models.Attendance;
import com.example.payroll.models.Attendance.AttendanceStatus;
import com.example.payroll.repository.AttendanceRepository;
import com.example.payroll.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    /** Employee checks in for today */
    public Attendance checkIn(String employeeId, String employeeName) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent()) {
            throw new RuntimeException("Already checked in for today.");
        }
        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setEmployeeName(employeeName);
        attendance.setDate(today);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setStatus(AttendanceStatus.PRESENT);
        return attendanceRepository.save(attendance);
    }

    /** Employee checks out for today */
    public Attendance checkOut(String employeeId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in record found for today."));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Already checked out for today.");
        }

        attendance.setCheckOutTime(LocalDateTime.now());

        // Calculate hours worked
        long minutes = ChronoUnit.MINUTES.between(attendance.getCheckInTime(), attendance.getCheckOutTime());
        double hours = minutes / 60.0;
        attendance.setHoursWorked(Math.round(hours * 100.0) / 100.0);

        // Overtime: more than 8 hours
        if (hours > 8.0) {
            attendance.setOvertimeHours(Math.round((hours - 8.0) * 100.0) / 100.0);
        }

        // Half day if less than 4 hours
        if (hours < 4.0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        return attendanceRepository.save(attendance);
    }

    /** Get today's attendance for an employee */
    public Optional<Attendance> getTodayAttendance(String employeeId) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now());
    }

    /** Paginated history for a specific employee */
    public Page<Attendance> getEmployeeHistory(String employeeId, Pageable pageable) {
        return attendanceRepository.findByEmployeeIdOrderByDateDesc(employeeId, pageable);
    }

    /** Admin: all attendance records paginated */
    public Page<Attendance> getAllAttendance(Pageable pageable) {
        return attendanceRepository.findAllByOrderByDateDesc(pageable);
    }

    /** Admin: filter by date range */
    public List<Attendance> getByDateRange(LocalDate start, LocalDate end) {
        return attendanceRepository.findByDateBetweenOrderByDateDesc(start, end);
    }

    /** Get stats for an employee */
    public java.util.Map<String, Long> getStats(String employeeId) {
        long present = attendanceRepository.countByEmployeeIdAndStatus(employeeId, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByEmployeeIdAndStatus(employeeId, AttendanceStatus.ABSENT);
        long halfDay = attendanceRepository.countByEmployeeIdAndStatus(employeeId, AttendanceStatus.HALF_DAY);
        long onLeave = attendanceRepository.countByEmployeeIdAndStatus(employeeId, AttendanceStatus.ON_LEAVE);
        return java.util.Map.of("present", present, "absent", absent, "halfDay", halfDay, "onLeave", onLeave);
    }
}

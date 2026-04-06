package com.example.payroll.controller;

import com.example.payroll.models.Attendance;
import com.example.payroll.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    /** Employee: Check in for today */
    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(Authentication auth) {
        try {
            String employeeId = auth.getName();
            // Use employeeId as name fallback; ideally look up actual name
            Attendance result = attendanceService.checkIn(employeeId, employeeId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Employee: Check out for today */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkOut(Authentication auth) {
        try {
            Attendance result = attendanceService.checkOut(auth.getName());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Employee: Get today's record */
    @GetMapping("/today")
    public ResponseEntity<?> getToday(Authentication auth) {
        return attendanceService.getTodayAttendance(auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /** Employee: Get own attendance stats (counts) */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats(Authentication auth) {
        return ResponseEntity.ok(attendanceService.getStats(auth.getName()));
    }

    /** Employee: Get own paginated history */
    @GetMapping("/history")
    public Page<Attendance> getHistory(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return attendanceService.getEmployeeHistory(auth.getName(), PageRequest.of(page, size));
    }

    /** Admin: Get all attendance records paginated */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Attendance> getAllAttendance(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return attendanceService.getAllAttendance(PageRequest.of(page, size));
    }

    /** Admin: Filter attendance by date range */
    @GetMapping("/admin/range")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Attendance> getByRange(
            @RequestParam String start,
            @RequestParam String end) {
        return attendanceService.getByDateRange(LocalDate.parse(start), LocalDate.parse(end));
    }
}

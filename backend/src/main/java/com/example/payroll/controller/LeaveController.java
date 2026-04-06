package com.example.payroll.controller;

import com.example.payroll.models.Leave;
import com.example.payroll.models.Leave.LeaveStatus;
import com.example.payroll.models.LeaveBalance;
import com.example.payroll.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    /** Employee: Apply for leave */
    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@RequestBody Leave leaveRequest, Authentication auth) {
        try {
            String employeeId = auth.getName();
            Leave result = leaveService.applyLeave(employeeId, employeeId, leaveRequest);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Employee: Get own leave history */
    @GetMapping("/my")
    public Page<Leave> getMyLeaves(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return leaveService.getMyLeaves(auth.getName(), PageRequest.of(page, size));
    }

    /** Employee: Get own leave balance */
    @GetMapping("/balance")
    public LeaveBalance getBalance(Authentication auth) {
        return leaveService.getBalance(auth.getName());
    }

    /** Admin: Get all leaves (optional status filter) */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Leave> getAllLeaves(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (status != null && !status.isBlank()) {
            return leaveService.getLeavesByStatus(LeaveStatus.valueOf(status.toUpperCase()), PageRequest.of(page, size));
        }
        return leaveService.getAllLeaves(PageRequest.of(page, size));
    }

    /** Admin: Get pending leave count (for dashboard badge) */
    @GetMapping("/admin/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> getPendingCount() {
        return Map.of("pending", leaveService.countPending());
    }

    /** Admin: Approve a leave request */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveLeave(@PathVariable String id, Authentication auth) {
        try {
            Leave result = leaveService.approveLeave(id, auth.getName());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Admin: Reject a leave request */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectLeave(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        try {
            String reason = body != null ? body.getOrDefault("reason", "") : "";
            Leave result = leaveService.rejectLeave(id, auth.getName(), reason);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

package com.example.payroll.service;

import com.example.payroll.models.Leave;
import com.example.payroll.models.Leave.LeaveStatus;
import com.example.payroll.models.Leave.LeaveType;
import com.example.payroll.models.LeaveBalance;
import com.example.payroll.models.Notification.NotificationType;
import com.example.payroll.repository.LeaveRepository;
import com.example.payroll.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private NotificationService notificationService;

    /** Initialize leave balance for a new employee. Idempotent. */
    public LeaveBalance initBalance(String employeeId) {
        return leaveBalanceRepository.findByEmployeeId(employeeId).orElseGet(() -> {
            LeaveBalance lb = new LeaveBalance();
            lb.setEmployeeId(employeeId);
            return leaveBalanceRepository.save(lb);
        });
    }

    /** Get leave balance, auto-init if not yet created */
    public LeaveBalance getBalance(String employeeId) {
        return leaveBalanceRepository.findByEmployeeId(employeeId).orElseGet(() -> initBalance(employeeId));
    }

    /** Employee applies for leave */
    public Leave applyLeave(String employeeId, String employeeName, Leave leaveRequest) {
        // Calculate total days
        long days = java.time.temporal.ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
        leaveRequest.setTotalDays((int) days);

        // Check balance
        LeaveBalance balance = getBalance(employeeId);
        validateBalance(balance, leaveRequest.getLeaveType(), (int) days);

        leaveRequest.setEmployeeId(employeeId);
        leaveRequest.setEmployeeName(employeeName);
        leaveRequest.setStatus(LeaveStatus.PENDING);
        leaveRequest.setAppliedOn(LocalDateTime.now());
        return leaveRepository.save(leaveRequest);
    }

    /** Admin approves a leave */
    public Leave approveLeave(String leaveId, String approvedBy) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Leave is not in PENDING state.");
        }

        // Deduct from balance
        LeaveBalance balance = getBalance(leave.getEmployeeId());
        deductBalance(balance, leave.getLeaveType(), leave.getTotalDays());
        leaveBalanceRepository.save(balance);

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setReviewedBy(approvedBy);
        leave.setReviewedOn(LocalDateTime.now());
        
        Leave updated = leaveRepository.save(leave);
        
        // Notify employee
        notificationService.createNotification(
            leave.getEmployeeId(),
            "Your leave request for " + leave.getStartDate() + " has been APPROVED.",
            NotificationType.SUCCESS
        );
        
        return updated;
    }

    /** Admin rejects a leave */
    public Leave rejectLeave(String leaveId, String reviewedBy, String reason) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Leave is not in PENDING state.");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setReviewedBy(reviewedBy);
        leave.setReviewedOn(LocalDateTime.now());
        leave.setRejectionReason(reason);
        
        Leave updated = leaveRepository.save(leave);
        
        // Notify employee
        notificationService.createNotification(
            leave.getEmployeeId(),
            "Your leave request for " + leave.getStartDate() + " was REJECTED. Reason: " + reason,
            NotificationType.ERROR
        );
        
        return updated;
    }

    /** Employee's own leave history */
    public Page<Leave> getMyLeaves(String employeeId, Pageable pageable) {
        return leaveRepository.findByEmployeeIdOrderByAppliedOnDesc(employeeId, pageable);
    }

    /** Admin: all leaves paginated */
    public Page<Leave> getAllLeaves(Pageable pageable) {
        return leaveRepository.findAllByOrderByAppliedOnDesc(pageable);
    }

    /** Admin: filter by status */
    public Page<Leave> getLeavesByStatus(LeaveStatus status, Pageable pageable) {
        return leaveRepository.findByStatusOrderByAppliedOnDesc(status, pageable);
    }

    /** Count pending leaves (for admin dashboard) */
    public long countPending() {
        return leaveRepository.countByStatus(LeaveStatus.PENDING);
    }

    // --- Private helpers ---

    private void validateBalance(LeaveBalance balance, LeaveType type, int days) {
        int remaining = switch (type) {
            case SICK -> balance.getSickLeaves() - balance.getUsedSick();
            case CASUAL -> balance.getCasualLeaves() - balance.getUsedCasual();
            case EARNED -> balance.getEarnedLeaves() - balance.getUsedEarned();
        };
        if (remaining < days) {
            throw new RuntimeException("Insufficient " + type + " leave balance. Available: " + remaining);
        }
    }

    private void deductBalance(LeaveBalance balance, LeaveType type, int days) {
        switch (type) {
            case SICK -> balance.setUsedSick(balance.getUsedSick() + days);
            case CASUAL -> balance.setUsedCasual(balance.getUsedCasual() + days);
            case EARNED -> balance.setUsedEarned(balance.getUsedEarned() + days);
        }
    }
}

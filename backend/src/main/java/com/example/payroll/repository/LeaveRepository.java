package com.example.payroll.repository;

import com.example.payroll.models.Leave;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface LeaveRepository extends MongoRepository<Leave, String> {
    Page<Leave> findByEmployeeIdOrderByAppliedOnDesc(String employeeId, Pageable pageable);
    Page<Leave> findByStatusOrderByAppliedOnDesc(Leave.LeaveStatus status, Pageable pageable);
    Page<Leave> findAllByOrderByAppliedOnDesc(Pageable pageable);
    List<Leave> findByEmployeeIdAndStatus(String employeeId, Leave.LeaveStatus status);
    long countByStatus(Leave.LeaveStatus status);
}

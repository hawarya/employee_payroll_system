package com.example.payroll.repository;

import com.example.payroll.models.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    Optional<Attendance> findByEmployeeIdAndDate(String employeeId, LocalDate date);
    Page<Attendance> findByEmployeeIdOrderByDateDesc(String employeeId, Pageable pageable);
    Page<Attendance> findAllByOrderByDateDesc(Pageable pageable);
    List<Attendance> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeIdAndDateBetween(String employeeId, LocalDate startDate, LocalDate endDate);
    long countByEmployeeIdAndStatus(String employeeId, Attendance.AttendanceStatus status);
}

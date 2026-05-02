package com.example.payroll.repository;

import com.example.payroll.models.Role;
import com.example.payroll.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmployeeId(String employeeId);
    Boolean existsByEmployeeId(String employeeId);
    Optional<User> findByEmail(String email);
    List<User> findByRolesIn(Set<Role> roles);
}

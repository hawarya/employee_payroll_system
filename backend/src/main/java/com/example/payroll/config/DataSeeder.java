package com.example.payroll.config;

import com.example.payroll.models.Employee;
import com.example.payroll.models.EmployeeType;
import com.example.payroll.models.Role;
import com.example.payroll.models.User;
import com.example.payroll.repository.EmployeeRepository;
import com.example.payroll.repository.UserRepository;
import com.example.payroll.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Admin if not exists
        if (!employeeRepository.findByEmployeeId("admin_test1").isPresent()) {
            Employee admin = new Employee();
            admin.setEmployeeId("admin_test1");
            admin.setName("Admin Test");
            admin.setEmail("admin@example.com");
            admin.setDepartment("Management");
            admin.setDesignation("System Admin");
            admin.setType(EmployeeType.FULL_TIME);
            admin.setBaseSalary(100000.0);
            employeeRepository.save(admin);
            
            // Ensure User has Admin role and email
            User user = userRepository.findByEmployeeId("admin_test1").get();
            user.setPassword(encoder.encode("password"));
            user.setEmail("admin@example.com");
            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_ADMIN);
            user.setRoles(roles);
            userRepository.save(user);
            System.out.println("Seeded Admin: admin_test1 / password / admin@example.com");
        } else {
            // Ensure existing admin user has email set
            userRepository.findByEmployeeId("admin_test1").ifPresent(user -> {
                if (user.getEmail() == null || user.getEmail().isEmpty()) {
                    user.setEmail("admin@example.com");
                    userRepository.save(user);
                    System.out.println("Updated Admin user with email: admin@example.com");
                }
            });
        }

        // Create Employee if not exists
        if (!employeeRepository.findByEmployeeId("EMP_001").isPresent()) {
            Employee emp = new Employee();
            emp.setEmployeeId("EMP_001");
            emp.setName("John Doe");
            emp.setEmail("john@example.com");
            emp.setDepartment("Engineering");
            emp.setDesignation("Software Engineer");
            emp.setType(EmployeeType.FULL_TIME);
            emp.setBaseSalary(60000.0);
            employeeRepository.save(emp);

            // Set password and email for the test user
            User user = userRepository.findByEmployeeId("EMP_001").get();
            user.setPassword(encoder.encode("password"));
            user.setEmail("john@example.com");
            userRepository.save(user);
            System.out.println("Seeded Employee: EMP_001 / password / john@example.com");
        } else {
            // Ensure existing employee user has email set
            userRepository.findByEmployeeId("EMP_001").ifPresent(user -> {
                if (user.getEmail() == null || user.getEmail().isEmpty()) {
                    user.setEmail("john@example.com");
                    userRepository.save(user);
                    System.out.println("Updated EMP_001 user with email: john@example.com");
                }
            });
        }
    }
}

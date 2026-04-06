package com.example.payroll.service;

import com.example.payroll.models.Employee;
import com.example.payroll.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class EmployeeService {
    @Autowired
    private EmployeeRepository employeeRepository;

    public Page<Employee> getAllEmployees(String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return employeeRepository.findByNameContainingIgnoreCase(search, pageable);
        }
        return employeeRepository.findAll(pageable);
    }

    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId);
    }

    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(String id, Employee updatedDetails) {
        return employeeRepository.findById(id).map(employee -> {
            employee.setName(updatedDetails.getName());
            employee.setEmail(updatedDetails.getEmail());
            employee.setDepartment(updatedDetails.getDepartment());
            employee.setDesignation(updatedDetails.getDesignation());
            employee.setType(updatedDetails.getType());
            employee.setBaseSalary(updatedDetails.getBaseSalary());
            employee.setHourlyRate(updatedDetails.getHourlyRate());
            employee.setContractAmount(updatedDetails.getContractAmount());
            employee.setBonus(updatedDetails.getBonus());
            employee.setTaxDeduction(updatedDetails.getTaxDeduction());
            employee.setPfDeduction(updatedDetails.getPfDeduction());
            employee.setHoursWorked(updatedDetails.getHoursWorked());
            return employeeRepository.save(employee);
        }).orElseThrow(() -> new RuntimeException("Employee not found with id " + id));
    }

    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }
}

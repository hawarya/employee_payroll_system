package com.example.payroll.controller;

import com.example.payroll.models.Employee;
import com.example.payroll.service.EmployeeService;
import com.example.payroll.service.SalaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    
    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private SalaryService salaryService;

    // Get All with pagination and search
    // Get All with pagination and search
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Employee> getAllEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable paging = PageRequest.of(page, size);
        return employeeService.getAllEmployees(search, paging);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id, org.springframework.security.core.Authentication auth) {
        java.util.Optional<Employee> empOpt = "me".equals(id) ? 
            employeeService.getEmployeeByEmployeeId(auth.getName()) : 
            employeeService.getEmployeeById(id);
            
        return empOpt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Only Admin can add employee
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    // Only Admin can update employee
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> updateEmployee(@PathVariable String id, @RequestBody Employee employeeDetails) {
        try {
            return ResponseEntity.ok(employeeService.updateEmployee(id, employeeDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Only Admin can delete employee
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }

    // Payroll info
    @GetMapping("/{id}/salary")
    public ResponseEntity<?> getSalaryDetails(@PathVariable String id, org.springframework.security.core.Authentication auth) {
        java.util.Optional<Employee> empOpt = "me".equals(id) ? 
            employeeService.getEmployeeByEmployeeId(auth.getName()) : 
            employeeService.getEmployeeById(id);
            
        return empOpt.map(emp -> {
            Map<String, Object> response = new HashMap<>();
            response.put("employee", emp);
            response.put("netSalary", salaryService.calculateNetSalary(emp));
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin: Payroll Report for all employees
    @GetMapping("/reports/payroll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPayrollReport() {
        java.util.List<Employee> all = employeeService.getAllEmployees(null, PageRequest.of(0, 1000)).getContent();
        java.util.List<Map<String, Object>> report = all.stream().map(emp -> {
            Map<String, Object> row = new HashMap<>();
            row.put("id", emp.getId());
            row.put("employeeId", emp.getEmployeeId());
            row.put("name", emp.getName());
            row.put("department", emp.getDepartment());
            row.put("designation", emp.getDesignation());
            row.put("type", emp.getType());
            row.put("baseSalary", emp.getBaseSalary());
            row.put("bonus", emp.getBonus());
            row.put("taxDeduction", emp.getTaxDeduction());
            row.put("pfDeduction", emp.getPfDeduction());
            row.put("netSalary", salaryService.calculateNetSalary(emp));
            return row;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(report);
    }

    // PDF Export
    @GetMapping("/{id}/salary/export-pdf")
    public ResponseEntity<byte[]> exportSalarySlipPdf(@PathVariable String id, org.springframework.security.core.Authentication auth) {
        java.util.Optional<Employee> empOpt = "me".equals(id) ? 
            employeeService.getEmployeeByEmployeeId(auth.getName()) : 
            employeeService.getEmployeeById(id);
            
        return empOpt.map(emp -> {
            byte[] pdfBytes = salaryService.generateSalarySlipPdf(emp);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "salary_slip_" + (emp.getEmployeeId() != null ? emp.getEmployeeId() : emp.getId()) + ".pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        }).orElse(ResponseEntity.notFound().build());
    }
}

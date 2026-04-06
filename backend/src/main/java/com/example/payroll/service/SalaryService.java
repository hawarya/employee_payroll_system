package com.example.payroll.service;

import com.example.payroll.models.Employee;
import com.example.payroll.models.EmployeeType;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;

@Service
public class SalaryService {
    
    /** Standard working hours per day used for overtime threshold */
    private static final double STANDARD_HOURS_PER_DAY = 8.0;
    private static final double OVERTIME_MULTIPLIER = 1.5;

    public Double calculateNetSalary(Employee emp) {
        if (emp.getType() == EmployeeType.FULL_TIME) {
            Double base = emp.getBaseSalary() != null ? emp.getBaseSalary() : 0.0;
            Double bonus = emp.getBonus() != null ? emp.getBonus() : 0.0;
            Double tax = emp.getTaxDeduction() != null ? emp.getTaxDeduction() : 0.0;
            Double pf = emp.getPfDeduction() != null ? emp.getPfDeduction() : 0.0;
            return base + bonus - tax - pf;
        } else if (emp.getType() == EmployeeType.PART_TIME) {
            Double rate = emp.getHourlyRate() != null ? emp.getHourlyRate() : 0.0;
            Double hours = emp.getHoursWorked() != null ? emp.getHoursWorked() : 0.0;
            double[] breakdown = calculateOvertimeBreakdown(hours, rate);
            return breakdown[0] + breakdown[1]; // regularPay + overtimePay
        } else if (emp.getType() == EmployeeType.CONTRACT) {
            return emp.getContractAmount() != null ? emp.getContractAmount() : 0.0;
        }
        return 0.0;
    }

    /**
     * Returns [regularPay, overtimePay] for part-time/hourly employees.
     * Overtime kicks in when total hours exceed 8 hours (treated as single-day threshold).
     */
    public double[] calculateOvertimeBreakdown(Double hours, Double rate) {
        if (hours == null || rate == null) return new double[]{0.0, 0.0};
        if (hours <= STANDARD_HOURS_PER_DAY) {
            return new double[]{hours * rate, 0.0};
        }
        double regularPay = STANDARD_HOURS_PER_DAY * rate;
        double overtimePay = (hours - STANDARD_HOURS_PER_DAY) * rate * OVERTIME_MULTIPLIER;
        return new double[]{regularPay, overtimePay};
    }

    public byte[] generateSalarySlipPdf(Employee emp) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            
            document.add(new Paragraph("EMPLOYEE PAYROLL SLIP"));
            document.add(new Paragraph("----------------------------------"));
            document.add(new Paragraph("Employee ID: " + emp.getId()));
            document.add(new Paragraph("Name: " + emp.getName()));
            document.add(new Paragraph("Department: " + emp.getDepartment() + " (" + emp.getDesignation() + ")"));
            document.add(new Paragraph("Type: " + emp.getType()));
            document.add(new Paragraph("----------------------------------"));
            
            Double netSalary = calculateNetSalary(emp);
            
            if (emp.getType() == EmployeeType.FULL_TIME) {
                document.add(new Paragraph("Base Salary: $" + emp.getBaseSalary()));
                document.add(new Paragraph("Bonus: +$" + emp.getBonus()));
                document.add(new Paragraph("Tax Deduction: -$" + emp.getTaxDeduction()));
                document.add(new Paragraph("PF Deduction: -$" + emp.getPfDeduction()));
            } else if (emp.getType() == EmployeeType.PART_TIME) {
                double[] ot = calculateOvertimeBreakdown(emp.getHoursWorked(), emp.getHourlyRate());
                document.add(new Paragraph("Hourly Rate: $" + emp.getHourlyRate()));
                document.add(new Paragraph("Hours Worked: " + emp.getHoursWorked() + " hrs"));
                document.add(new Paragraph("Regular Pay (up to 8h): $" + String.format("%.2f", ot[0])));
                if (ot[1] > 0) {
                    document.add(new Paragraph("Overtime Pay (1.5x): +$" + String.format("%.2f", ot[1])));
                }
            } else if (emp.getType() == EmployeeType.CONTRACT) {
                document.add(new Paragraph("Contract Amount: $" + emp.getContractAmount()));
            }
            
            document.add(new Paragraph("----------------------------------"));
            document.add(new Paragraph("NET PAY: $" + netSalary));
            document.add(new Paragraph("----------------------------------"));
            document.add(new Paragraph("Generated automatically by Employee Payroll System."));
            
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}

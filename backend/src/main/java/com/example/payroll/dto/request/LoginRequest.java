package com.example.payroll.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String employeeId;

    @NotBlank
    private String password;

    private String role;
}

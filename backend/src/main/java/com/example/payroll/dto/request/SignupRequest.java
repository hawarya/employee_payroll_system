package com.example.payroll.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String employeeId;

    @NotBlank
    private String name;

    @NotBlank
    private String password;
}

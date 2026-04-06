package com.example.payroll.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String id;
    private String username;
    private List<String> roles;
}

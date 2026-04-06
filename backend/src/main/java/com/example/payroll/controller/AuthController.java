package com.example.payroll.controller;

import com.example.payroll.dto.request.LoginRequest;
import com.example.payroll.dto.request.SignupRequest;
import com.example.payroll.dto.response.JwtResponse;
import com.example.payroll.dto.response.MessageResponse;
import com.example.payroll.models.Role;
import com.example.payroll.models.User;
import com.example.payroll.repository.UserRepository;
import com.example.payroll.security.jwt.JwtUtils;
import com.example.payroll.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmployeeId(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmployeeId(signUpRequest.getEmployeeId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Employee ID is already registered!"));
        }

        // Create new user's account
        User user = new User();
        user.setEmployeeId(signUpRequest.getEmployeeId());
        user.setName(signUpRequest.getName());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        Set<Role> roles = new HashSet<>();
        // Give ROLE_ADMIN to any employeeId containing "admin"
        if (signUpRequest.getEmployeeId().trim().toLowerCase().contains("admin")) {
            roles.add(Role.ROLE_ADMIN);
        } else {
            roles.add(Role.ROLE_USER);
        }
        
        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}

package com.example.payroll.controller;

import com.example.payroll.dto.request.*;
import com.example.payroll.dto.response.JwtResponse;
import com.example.payroll.dto.response.MessageResponse;
import com.example.payroll.events.OtpPurpose;
import com.example.payroll.models.Employee;
import com.example.payroll.models.Role;
import com.example.payroll.models.User;
import com.example.payroll.repository.EmployeeRepository;
import com.example.payroll.repository.UserRepository;
import com.example.payroll.security.jwt.JwtUtils;
import com.example.payroll.security.services.UserDetailsImpl;
import com.example.payroll.service.OtpService;
import com.example.payroll.service.OtpService.OtpVerificationResult;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
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
    EmployeeRepository employeeRepository;

    @Autowired
    OtpService otpService;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    // ==================== OTP-BASED LOGIN ====================

    /**
     * Step 1: Send OTP to user's email for login.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendLoginOtp(@Valid @RequestBody OtpRequest request) {
        // Check if user exists with this email
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Also check Employee table as fallback
            Optional<Employee> empOpt = employeeRepository.findByEmail(request.getEmail());
            if (empOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: No account found with this email address."));
            }
        }

        otpService.generateAndSendOtp(request.getEmail(), OtpPurpose.LOGIN);
        return ResponseEntity.ok(new MessageResponse("OTP sent successfully to " + request.getEmail()));
    }

    /**
     * Step 2: Verify OTP and return JWT token for login.
     */
    @PostMapping("/verify-otp-login")
    public ResponseEntity<?> verifyOtpAndLogin(@Valid @RequestBody OtpVerifyRequest request) {
        OtpVerificationResult result = otpService.verifyOtp(request.getEmail(), request.getOtp());

        if (!result.success()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + result.message()));
        }

        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Try to find via Employee email -> employeeId -> User
            Optional<Employee> empOpt = employeeRepository.findByEmail(request.getEmail());
            if (empOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User account not found."));
            }
            userOpt = userRepository.findByEmployeeId(empOpt.get().getEmployeeId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User account not found."));
            }
        }

        User user = userOpt.get();

        // Build JWT directly (OTP-verified, no password needed)
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        UserDetailsImpl.build(user), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authToken);

        String jwt = jwtUtils.generateJwtToken(authToken);

        List<String> roles = authorities.stream()
                .map(SimpleGrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getEmployeeId(), roles));
    }

    // ==================== PASSWORD-BASED LOGIN (FALLBACK) ====================

    /**
     * Traditional login with employeeId + password.
     */
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

    // ==================== SIGNUP ====================

    @PostMapping("/signup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmployeeId(signUpRequest.getEmployeeId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Employee ID is already registered!"));
        }

        // Create new user's account
        User user = new User();
        user.setEmployeeId(signUpRequest.getEmployeeId());
        user.setName(signUpRequest.getName());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        // Copy email from Employee record if exists
        Optional<Employee> empOpt = employeeRepository.findByEmployeeId(signUpRequest.getEmployeeId());
        empOpt.ifPresent(emp -> user.setEmail(emp.getEmail()));

        Set<Role> roles = new HashSet<>();
        if (signUpRequest.getEmployeeId().trim().toLowerCase().contains("admin")) {
            roles.add(Role.ROLE_ADMIN);
        } else {
            roles.add(Role.ROLE_USER);
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    // ==================== FORGOT PASSWORD (OTP-BASED) ====================

    /**
     * Step 1: Send OTP for password reset.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody OtpRequest request) {
        // Verify email exists in Employee or User table
        Optional<Employee> empOpt = employeeRepository.findByEmail(request.getEmail());
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (empOpt.isEmpty() && userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: No account found with this email address."));
        }

        otpService.generateAndSendOtp(request.getEmail(), OtpPurpose.PASSWORD_RESET);
        return ResponseEntity.ok(new MessageResponse("Password reset OTP sent to " + request.getEmail()));
    }

    /**
     * Step 2: Verify OTP for password reset.
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody OtpVerifyRequest request) {
        OtpVerificationResult result = otpService.verifyOtp(request.getEmail(), request.getOtp());

        if (!result.success()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + result.message()));
        }

        return ResponseEntity.ok(new MessageResponse("OTP verified. You can now reset your password."));
    }

    /**
     * Step 3: Reset password after OTP verification.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // Find the user by email
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            // Fallback: find via Employee
            Optional<Employee> empOpt = employeeRepository.findByEmail(request.getEmail());
            if (empOpt.isPresent()) {
                userOpt = userRepository.findByEmployeeId(empOpt.get().getEmployeeId());
            }
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }

        User user = userOpt.get();
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
    }
}

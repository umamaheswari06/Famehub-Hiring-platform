package com.hiring.controller;

import com.hiring.dto.*;
import com.hiring.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for registering, logging in and refreshing tokens")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a user profile. Default role is ROLE_CANDIDATE if not specified.")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Verifies password and issues JWT access token and refresh token.")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticateUser(request));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token", description = "Validates refresh token and issues a new access token.")
    public ResponseEntity<?> refreshJwtToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshJwtToken(request));
    }
}

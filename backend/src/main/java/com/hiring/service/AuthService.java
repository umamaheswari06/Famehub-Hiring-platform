package com.hiring.service;

import com.hiring.dto.*;
import com.hiring.exception.BadRequestException;
import com.hiring.exception.ConflictException;
import com.hiring.exception.ResourceNotFoundException;
import com.hiring.model.Role;
import com.hiring.model.User;
import com.hiring.repository.RoleRepository;
import com.hiring.repository.UserRepository;
import com.hiring.security.JwtUtils;
import com.hiring.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public User registerUser(RegisterRequest request) {
        log.info("Registering user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email {} is already in use", request.getEmail());
            throw new ConflictException("Error: Email is already in use!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();

        Set<String> strRoles = request.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_CANDIDATE is not found."));
            roles.add(candidateRole);
        } else {
            for (String role : strRoles) {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_ADMIN is not found."));
                        roles.add(adminRole);
                        break;
                    case "hr":
                        Role hrRole = roleRepository.findByName("ROLE_HR")
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_HR is not found."));
                        roles.add(hrRole);
                        break;
                    default:
                        Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_CANDIDATE is not found."));
                        roles.add(candidateRole);
                }
            }
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        log.info("Successfully registered user: {}, ID: {}", savedUser.getEmail(), savedUser.getId());
        return savedUser;
    }

    public JwtResponse authenticateUser(LoginRequest request) {
        log.info("Attempting to authenticate user: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String refreshToken = jwtUtils.generateRefreshTokenFromUsername(userDetails.getUsername());

        log.info("User {} successfully authenticated, roles={}", request.getEmail(), roles);

        return new JwtResponse(
                jwt,
                refreshToken,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getUsername(),
                roles);
    }

    public TokenRefreshResponse refreshJwtToken(TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        log.info("Attempting token refresh");

        if (jwtUtils.validateJwtToken(refreshToken)) {
            String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
            String newAccessToken = jwtUtils.generateTokenFromUsername(username);
            log.info("Token refresh successful for user: {}", username);
            return new TokenRefreshResponse(newAccessToken, refreshToken);
        } else {
            log.warn("Token refresh failed: Refresh token is invalid or expired");
            throw new BadRequestException("Refresh token is invalid or expired!");
        }
    }
}

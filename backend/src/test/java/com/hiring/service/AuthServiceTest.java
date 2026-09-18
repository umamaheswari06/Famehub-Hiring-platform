package com.hiring.service;

import com.hiring.dto.RegisterRequest;
import com.hiring.model.Role;
import com.hiring.model.User;
import com.hiring.repository.RoleRepository;
import com.hiring.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private Role candidateRole;

    @BeforeEach
    public void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Jane Doe");
        registerRequest.setEmail("jane@example.com");
        registerRequest.setPassword("securepassword");
        registerRequest.setRoles(Set.of("candidate"));

        candidateRole = new Role(1L, "ROLE_CANDIDATE");
    }

    @Test
    public void testRegisterUser_Success() {
        // Mocking behavior
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(roleRepository.findByName("ROLE_CANDIDATE")).thenReturn(Optional.of(candidateRole));
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        
        User savedUser = User.builder()
                .id(1L)
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password("encodedPassword")
                .roles(Set.of(candidateRole))
                .active(true)
                .build();
                
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Run service method
        User result = authService.registerUser(registerRequest);

        // Assertions
        assertNotNull(result);
        assertEquals("Jane Doe", result.getName());
        assertEquals("jane@example.com", result.getEmail());
        assertEquals("encodedPassword", result.getPassword());
        assertTrue(result.isActive());
        assertTrue(result.getRoles().contains(candidateRole));

        verify(userRepository, times(1)).existsByEmail(registerRequest.getEmail());
        verify(roleRepository, times(1)).findByName("ROLE_CANDIDATE");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void testRegisterUser_EmailAlreadyExists() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Assert exceptions
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(registerRequest);
        });

        assertEquals("Error: Email is already in use!", exception.getMessage());
        verify(userRepository, times(0)).save(any(User.class));
    }
}

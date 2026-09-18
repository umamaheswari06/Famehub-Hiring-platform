package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;
    private Long id;
    private String name;
    private String email;
    private List<String> roles;
}

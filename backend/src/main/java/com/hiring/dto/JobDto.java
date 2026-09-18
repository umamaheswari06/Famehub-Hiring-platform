package com.hiring.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDto {
    private Long id;
    
    private Long departmentId;
    private String departmentName;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String location;

    private String salaryRange;

    @NotBlank
    private String type; // Full-time, Part-time, Contract, Internship
    
    private String status; // OPEN, CLOSED
}

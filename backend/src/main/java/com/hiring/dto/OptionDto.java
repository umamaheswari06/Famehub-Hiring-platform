package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionDto {
    private Long id;
    private String optionText;
    private boolean correct; // Will be hidden for candidates, populated for HR/Admin
}

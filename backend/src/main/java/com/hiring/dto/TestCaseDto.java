package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDto {
    private Long id;
    private String inputData;
    private String expectedOutput;
    private boolean hidden;
}

package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingQuestionDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String title;
    private String description;
    private String constraints;
    private String difficulty; // EASY, MEDIUM, HARD
    private String templateJava;
    private String templatePython;
    private String templateCpp;
    private String templateJs;
    private List<TestCaseDto> testCases;
}

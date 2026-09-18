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
public class AssessmentDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String title;
    private int durationMinutes;
    private double passingScore;
    private double negativeMarkingFactor;
    private String status;
    private String type; // MCQ or CODING
    private List<QuestionDto> questions;
}

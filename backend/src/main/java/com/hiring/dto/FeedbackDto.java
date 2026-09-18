package com.hiring.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    
    private Long interviewId;
    
    private Long reviewerId;
    private String reviewerName;

    @Min(1)
    @Max(5)
    private int rating;

    @NotBlank
    private String feedbackText;

    @NotBlank
    private String recommendation; // HIRE, REJECT, DEFER
}

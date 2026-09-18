package com.hiring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CodingSubmissionRequest {
    @NotNull
    private Long codingQuestionId;

    @NotBlank
    private String sourceCode;

    @NotBlank
    private String language; // java, python, cpp, javascript

    private List<JourneyEventDto> journeyEvents;
}

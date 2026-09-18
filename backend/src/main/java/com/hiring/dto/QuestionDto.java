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
public class QuestionDto {
    private Long id;
    private String questionText;
    private int points;
    private String type; // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE
    private List<OptionDto> options;
}

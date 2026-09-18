package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitMcqResponse {
    private Long submissionId;
    private double score;
    private String status; // COMPLETED
    private boolean passed;
    private int tabSwitches;
    private int copyPasteDetects;
}

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
public class CodingSubmissionResponse {
    private Long submissionId;
    private String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR
    private double executionTime;
    private long memoryUsage;
    private double score;
    private String errorMessage;
    private String cognitiveJourneyReport;
    private double runtimePercentile;
    private double memoryPercentile;
    private String submittedAt;
    private String submittedCode;
    private List<RuntimeBucket> runtimeDistribution;
    private List<TestCaseResult> testCaseResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuntimeBucket {
        private int runtimeMs;
        private int count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private Long testCaseId;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private boolean hidden;
        private String status;
        private Double executionTime;
        private Long memoryUsage;
    }
}

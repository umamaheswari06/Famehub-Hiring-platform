package com.hiring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coding_question_id", nullable = false)
    private CodingQuestion codingQuestion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Column(name = "source_code", nullable = false, columnDefinition = "TEXT")
    private String sourceCode;

    @Column(nullable = false, length = 50)
    private String language; // java, python, cpp, javascript

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR

    @Builder.Default
    private double score = 0.0;

    @Column(name = "execution_time")
    @Builder.Default
    private double executionTime = 0.0; // in seconds

    @Column(name = "memory_usage")
    @Builder.Default
    private long memoryUsage = 0; // in KB

    private String token; // Judge0 token

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "cognitive_journey_report", columnDefinition = "LONGTEXT")
    private String cognitiveJourneyReport;

    @Column(name = "runtime_percentile")
    private double runtimePercentile;

    @Column(name = "memory_percentile")
    private double memoryPercentile;

    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}

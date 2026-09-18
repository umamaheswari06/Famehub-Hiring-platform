package com.hiring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private int durationMinutes = 30;

    @Column(name = "passing_score", nullable = false)
    @Builder.Default
    private double passingScore = 50.0;

    @Column(name = "negative_marking_factor")
    @Builder.Default
    private double negativeMarkingFactor = 0.0; // Point deduction multiplier (e.g. 0.25)

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, DRAFT

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

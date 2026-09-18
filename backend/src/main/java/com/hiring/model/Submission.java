package com.hiring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "submissions",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"candidate_id", "assessment_id"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Builder.Default
    private double score = 0.0;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "STARTED"; // STARTED, COMPLETED

    @Column(name = "tab_switches")
    @Builder.Default
    private int tabSwitches = 0;

    @Column(name = "copy_paste_detects")
    @Builder.Default
    private int copyPasteDetects = 0;

    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
    }
}

package com.hiring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(length = 50)
    @Builder.Default
    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD

    @Column(name = "template_java", columnDefinition = "TEXT")
    private String templateJava;

    @Column(name = "template_python", columnDefinition = "TEXT")
    private String templatePython;

    @Column(name = "template_cpp", columnDefinition = "TEXT")
    private String templateCpp;

    @Column(name = "template_js", columnDefinition = "TEXT")
    private String templateJs;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

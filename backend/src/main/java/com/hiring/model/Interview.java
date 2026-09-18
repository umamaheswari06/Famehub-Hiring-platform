package com.hiring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Column(name = "schedule_time", nullable = false)
    private LocalDateTime scheduleTime;

    @Column(name = "meeting_room_id", nullable = false, length = 100)
    private String meetingRoomId; // Room name for Jitsi Meet iframe

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

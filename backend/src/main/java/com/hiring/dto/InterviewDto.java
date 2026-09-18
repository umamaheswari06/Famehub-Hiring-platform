package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDto {
    private Long id;
    private Long applicationId;
    private String jobTitle;
    private String candidateName;
    private String candidateEmail;
    private Long recruiterId;
    private String recruiterName;
    private LocalDateTime scheduleTime;
    private String meetingRoomId;
    private String status; // SCHEDULED, COMPLETED, CANCELLED
}

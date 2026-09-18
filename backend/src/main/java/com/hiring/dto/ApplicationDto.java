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
public class ApplicationDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long resumeId;
    private String resumeName;
    private String status; // APPLIED, SCREENING, ASSESSMENT, INTERVIEW, OFFERED, REJECTED, ARCHIVED
    private LocalDateTime appliedAt;
}

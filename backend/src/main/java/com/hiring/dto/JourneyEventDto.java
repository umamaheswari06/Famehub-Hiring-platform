package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JourneyEventDto {
    private long timestamp;
    private String eventType; // INITIAL_DRAFT, CODE_REVISION, COMPILE_RUN, TEST_FAIL, AI_TUTOR_ASK
    private String details;   // Error log, AI tutor query, or code summary snippet
}

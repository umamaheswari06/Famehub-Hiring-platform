package com.hiring.controller;

import com.hiring.dto.FeedbackDto;
import com.hiring.dto.InterviewDto;
import com.hiring.security.UserDetailsImpl;
import com.hiring.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Interview Scheduling", description = "Endpoints for scheduling meetings, retrieving details, and collecting reviewer feedback")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping("/api/hr/interviews")
    @Operation(summary = "Schedule a candidate video interview (HR role)", description = "Generates random room links and notifies the candidate.")
    public ResponseEntity<?> scheduleInterview(@Valid @RequestBody InterviewDto dto) {
        return ResponseEntity.ok(interviewService.scheduleInterview(dto));
    }

    @PostMapping("/api/hr/interviews/feedback")
    @Operation(summary = "Submit interview feedback (HR role)", description = "Saves interviewer score reviews and triggers final application evaluation states.")
    public ResponseEntity<?> submitFeedback(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                            @Valid @RequestBody FeedbackDto dto) {
        dto.setReviewerId(userDetails.getId());
        return ResponseEntity.ok(interviewService.submitFeedback(dto));
    }

    @GetMapping("/api/candidate/interviews")
    @Operation(summary = "Get current candidate's scheduled interviews")
    public ResponseEntity<?> getMyInterviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(interviewService.getInterviewsByCandidate(userDetails.getId()));
    }

    @GetMapping("/api/hr/interviews")
    @Operation(summary = "Get current recruiter's scheduled interviews (HR role)")
    public ResponseEntity<?> getRecruiterInterviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(interviewService.getInterviewsByRecruiter(userDetails.getId()));
    }

    @GetMapping("/api/hr/interviews/feedback/{interviewId}")
    @Operation(summary = "Retrieve feedback comments for an interview session (HR role)")
    public ResponseEntity<?> getFeedback(@PathVariable Long interviewId) {
        return ResponseEntity.ok(interviewService.getFeedbackForInterview(interviewId));
    }
}

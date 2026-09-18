package com.hiring.controller;

import com.hiring.security.UserDetailsImpl;
import com.hiring.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Job Applications", description = "Endpoints for applying to jobs and managing application pipelines")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/api/candidate/applications")
    @Operation(summary = "Submit a job application", description = "Associates candidate profile and selected resume with a job opening.")
    public ResponseEntity<?> applyToJob(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                        @RequestParam("jobId") Long jobId,
                                        @RequestParam(value = "resumeId", required = false) Long resumeId) {
        return ResponseEntity.ok(applicationService.applyToJob(jobId, userDetails.getId(), resumeId));
    }

    @GetMapping("/api/candidate/applications")
    @Operation(summary = "Get current candidate's applications history")
    public ResponseEntity<?> getMyApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationsByCandidate(userDetails.getId()));
    }

    @GetMapping("/api/hr/applications/job/{jobId}")
    @Operation(summary = "List all applications for a specific job (HR role)")
    public ResponseEntity<?> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    @GetMapping("/api/hr/applications/all")
    @Operation(summary = "List all applications globally (HR role)")
    public ResponseEntity<?> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PutMapping("/api/hr/applications/{id}/status")
    @Operation(summary = "Advance or change applicant status in pipeline (HR role)", description = "Permitted values: SCREENING, ASSESSMENT, INTERVIEW, OFFERED, REJECTED, ARCHIVED. Triggers automatic notification emails.")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @RequestParam("status") String status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }
}

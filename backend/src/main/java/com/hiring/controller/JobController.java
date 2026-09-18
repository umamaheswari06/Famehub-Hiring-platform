package com.hiring.controller;

import com.hiring.dto.JobDto;
import com.hiring.security.UserDetailsImpl;
import com.hiring.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Job Openings", description = "Endpoints for posting and managing job openings")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping("/api/hr/jobs")
    @Operation(summary = "Post a new Job Opening (Recruiter role)", description = "Saves job metrics and links it to recruiter context.")
    public ResponseEntity<?> createJob(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                       @Valid @RequestBody JobDto dto) {
        return ResponseEntity.ok(jobService.createJob(dto, userDetails.getId()));
    }

    @PutMapping("/api/hr/jobs/{id}")
    @Operation(summary = "Update Job Opening details")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @Valid @RequestBody JobDto dto) {
        return ResponseEntity.ok(jobService.updateJob(id, dto));
    }

    @PostMapping("/api/hr/jobs/{id}/close")
    @Operation(summary = "Close a Job Opening")
    public ResponseEntity<?> closeJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.closeJob(id));
    }

    @DeleteMapping("/api/hr/jobs/{id}")
    @Operation(summary = "Delete a Job Opening")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok("Job deleted successfully.");
    }

    @GetMapping("/api/public/jobs")
    @Operation(summary = "List all active Job Openings (Public access)")
    public ResponseEntity<?> getActiveJobs() {
        return ResponseEntity.ok(jobService.getOpenJobs());
    }

    @GetMapping("/api/hr/jobs/all")
    @Operation(summary = "List all Job Openings (Active & Closed, Recruiter/Admin view)")
    public ResponseEntity<?> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/api/public/jobs/{id}")
    @Operation(summary = "Get detailed Job Opening information")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }
}

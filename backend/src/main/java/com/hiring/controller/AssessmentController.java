package com.hiring.controller;

import com.hiring.dto.*;
import com.hiring.security.UserDetailsImpl;
import com.hiring.service.AssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "MCQ Assessments", description = "Endpoints for creating and conducting MCQ skill assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @PostMapping("/api/hr/assessments")
    @Operation(summary = "Create an MCQ assessment (HR role)")
    public ResponseEntity<?> createAssessment(@RequestBody AssessmentDto dto) {
        return ResponseEntity.ok(assessmentService.createAssessment(dto));
    }

    @PostMapping("/api/hr/coding")
    @Operation(summary = "Create a coding assessment/challenge (HR role)")
    public ResponseEntity<?> createCodingQuestion(@RequestBody com.hiring.dto.CodingQuestionDto dto) {
        return ResponseEntity.ok(assessmentService.createCodingQuestion(dto));
    }

    @GetMapping("/api/hr/assessments")
    @Operation(summary = "Get all assessments (HR role)")
    public ResponseEntity<?> getAllAssessments() {
        return ResponseEntity.ok(assessmentService.getAllAssessments());
    }

    @GetMapping("/api/hr/assessments/{id}")
    @Operation(summary = "Get full MCQ details with correct answer keys (HR role)")
    public ResponseEntity<?> getAssessmentForHr(@PathVariable Long id) {
        return ResponseEntity.ok(assessmentService.getAssessmentByIdFull(id));
    }

    @GetMapping("/api/candidate/assessments/{id}")
    @Operation(summary = "Get secure MCQ details (Answer keys are stripped for security)")
    public ResponseEntity<?> getAssessmentForCandidate(@PathVariable Long id) {
        return ResponseEntity.ok(assessmentService.getAssessmentByIdSecure(id));
    }

    @PostMapping("/api/candidate/assessments/{id}/start")
    @Operation(summary = "Register the start of an assessment attempt")
    public ResponseEntity<?> startAssessment(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(assessmentService.startAssessment(id, userDetails.getId()));
    }

    @PostMapping("/api/candidate/assessments/{id}/anti-cheat")
    @Operation(summary = "Log browser tab-switch or copy-paste violation activity")
    public ResponseEntity<?> trackCheating(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @RequestParam("tabSwitches") int tabSwitches,
                                           @RequestParam("copyPaste") int copyPaste) {
        assessmentService.trackAntiCheatingActivity(id, userDetails.getId(), tabSwitches, copyPaste);
        return ResponseEntity.ok("Anti-cheat logs updated successfully.");
    }

    @PostMapping("/api/candidate/assessments/submit")
    @Operation(summary = "Submit assessment answers for grading", description = "Computes final percentage score, handles negative markings, and emails outcomes.")
    public ResponseEntity<?> submitMcq(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                       @RequestBody SubmitMcqRequest request) {
        return ResponseEntity.ok(assessmentService.submitMcqAssessment(request, userDetails.getId()));
    }
}

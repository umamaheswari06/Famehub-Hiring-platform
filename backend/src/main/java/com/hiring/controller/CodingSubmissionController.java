package com.hiring.controller;

import com.hiring.dto.CodingSubmissionRequest;
import com.hiring.model.CodingQuestion;
import com.hiring.repository.CodingQuestionRepository;
import com.hiring.security.UserDetailsImpl;
import com.hiring.service.CodingSubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/candidate/coding")
@Tag(name = "Coding Assessments", description = "Endpoints for compiling, running, and grading code submissions")
public class CodingSubmissionController {

    @Autowired
    private CodingSubmissionService codingSubmissionService;

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @PostMapping("/submit")
    @Operation(summary = "Submit a coding challenge solution", description = "Executes solution code in the sandbox against public and hidden test cases, returning runtime execution reports.")
    public ResponseEntity<?> submitCode(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                        @Valid @RequestBody CodingSubmissionRequest request) {
        return ResponseEntity.ok(codingSubmissionService.evaluateSubmission(request, userDetails.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get coding challenge details for candidate")
    public ResponseEntity<?> getCodingQuestionForCandidate(@PathVariable Long id) {
        CodingQuestion cq = codingQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coding challenge not found with id: " + id));
        
        // Return a compatible structure with questions list for CodingEditor.jsx
        Map<String, Object> response = new HashMap<>();
        response.put("id", cq.getId());
        response.put("title", cq.getTitle());
        
        Map<String, Object> question = new HashMap<>();
        question.put("id", cq.getId());
        String questionText = cq.getDescription();
        if (cq.getConstraints() != null && !cq.getConstraints().isEmpty()) {
            questionText += "\n\n**Constraints:**\n" + cq.getConstraints();
        }
        question.put("questionText", questionText);
        question.put("templateJava", cq.getTemplateJava());
        question.put("templatePython", cq.getTemplatePython());
        question.put("templateCpp", cq.getTemplateCpp());
        question.put("templateJs", cq.getTemplateJs());
        
        response.put("questions", List.of(question));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start coding challenge")
    public ResponseEntity<?> startCodingChallenge(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "STARTED");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hr/submissions/candidate/{candidateId}")
    @Operation(summary = "Get coding submissions with AI Trajectory report (HR role)")
    public ResponseEntity<?> getCandidateSubmissions(@PathVariable Long candidateId) {
        return ResponseEntity.ok(codingSubmissionService.getSubmissionsByCandidate(candidateId));
    }
}

package com.hiring.controller;

import com.hiring.dto.AiTutorRequest;
import com.hiring.dto.AiTutorResponse;
import com.hiring.service.AiTutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/ai-tutor")
@Tag(name = "AI Tutor", description = "Endpoints for accessing the assessment online AI tutor")
public class AiTutorController {

    @Autowired
    private AiTutorService aiTutorService;

    @PostMapping("/feedback")
    @Operation(summary = "Get online pedagogical feedback / tutoring guidance for MCQ or Coding questions")
    public ResponseEntity<AiTutorResponse> getTutorFeedback(@RequestBody AiTutorRequest request) {
        AiTutorResponse response = aiTutorService.getFeedback(request);
        return ResponseEntity.ok(response);
    }
}

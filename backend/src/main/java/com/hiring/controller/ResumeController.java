package com.hiring.controller;

import com.hiring.model.Resume;
import com.hiring.security.UserDetailsImpl;
import com.hiring.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@Tag(name = "Resume Management", description = "Endpoints for uploading, previewing, downloading, and replacing resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/api/candidate/resume/upload")
    @Operation(summary = "Upload candidate resume", description = "Supports PDF and DOCX files. Stores files locally on a configurable disk path.")
    public ResponseEntity<?> uploadResume(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                          @RequestParam("file") MultipartFile file) throws IOException {
        Resume resume = resumeService.uploadResume(userDetails.getId(), file);
        return ResponseEntity.ok(resume);
    }

    @GetMapping("/api/candidate/resume/my")
    @Operation(summary = "Get current candidate resumes list")
    public ResponseEntity<?> getMyResumes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(resumeService.getResumesByUserId(userDetails.getId()));
    }

    @GetMapping("/api/public/resume/{id}/preview")
    @Operation(summary = "Preview resume in browser (Inline mode)", description = "Fetches the file stream directly for client embedding.")
    public ResponseEntity<Resource> previewResume(@PathVariable Long id) {
        Resume resume = resumeService.getResumeById(id);
        Resource resource = resumeService.loadResumeAsResource(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resume.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resume.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/api/public/resume/{id}/download")
    @Operation(summary = "Download resume attachment", description = "Downloads file with correct file attachment header.")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id) {
        Resume resume = resumeService.getResumeById(id);
        Resource resource = resumeService.loadResumeAsResource(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resume.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/api/candidate/resume/{id}")
    @Operation(summary = "Delete resume file")
    public ResponseEntity<?> deleteResume(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        // Simple security validation
        Resume resume = resumeService.getResumeById(id);
        if (!resume.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this resume.");
        }
        resumeService.deleteResume(id);
        return ResponseEntity.ok("Resume deleted successfully.");
    }
}

package com.hiring.controller;

import com.hiring.model.*;
import com.hiring.repository.*;
import com.hiring.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Analytics", description = "Endpoints for retrieving role-specific statistics and widgets")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private CodingSubmissionRepository codingSubmissionRepository;

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @GetMapping("/admin")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<?> getAdminStats() {
        long totalUsers = userRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalAssessments = assessmentRepository.count();

        List<User> allUsers = userRepository.findAll();
        long totalCandidates = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_CANDIDATE")))
                .count();
        long totalHrs = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_HR")))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalCandidates", totalCandidates);
        stats.put("totalHrs", totalHrs);
        stats.put("totalJobs", totalJobs);
        stats.put("totalApplications", totalApplications);
        stats.put("totalAssessments", totalAssessments);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/hr")
    @Operation(summary = "Get HR / Recruiter dashboard statistics")
    public ResponseEntity<?> getHrStats() {
        long activeJobs = jobRepository.findByStatus("OPEN").size();
        long candidateCount = applicationRepository.count();
        long mcqSubmissions = submissionRepository.count();
        long codingSubmissions = codingSubmissionRepository.count();
        
        List<Interview> interviews = interviewRepository.findAll();
        long scheduledInterviews = interviews.stream().filter(i -> i.getStatus().equals("SCHEDULED")).count();
        long completedInterviews = interviews.stream().filter(i -> i.getStatus().equals("COMPLETED")).count();

        // Calculate average MCQ score
        double avgMcqScore = submissionRepository.findAll().stream()
                .mapToDouble(Submission::getScore)
                .average()
                .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeJobs", activeJobs);
        stats.put("candidateCount", candidateCount);
        stats.put("mcqSubmissionsCount", mcqSubmissions);
        stats.put("codingSubmissionsCount", codingSubmissions);
        stats.put("scheduledInterviews", scheduledInterviews);
        stats.put("completedInterviews", completedInterviews);
        stats.put("averageMcqScore", avgMcqScore);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/candidate")
    @Operation(summary = "Get Candidate dashboard statistics")
    public ResponseEntity<?> getCandidateStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long candidateId = userDetails.getId();

        List<Application> myApps = applicationRepository.findByCandidateId(candidateId);
        long appliedJobsCount = myApps.size();

        List<Interview> myInterviews = interviewRepository.findByApplicationCandidateId(candidateId).stream()
                .filter(i -> i.getStatus().equals("SCHEDULED"))
                .collect(Collectors.toList());

        // Find assessments matching their applied jobs that haven't been completed yet
        List<Long> appliedJobIds = myApps.stream()
                .map(app -> app.getJob().getId())
                .collect(Collectors.toList());

        List<Assessment> activeAssessments = new ArrayList<>();
        if (!appliedJobIds.isEmpty()) {
            for (Long jobId : appliedJobIds) {
                activeAssessments.addAll(assessmentRepository.findByJobId(jobId).stream()
                        .filter(a -> a.getStatus().equals("ACTIVE"))
                        .collect(Collectors.toList()));
            }
        }

        // Filter out assessments that candidate already completed
        List<Submission> mySubmissions = submissionRepository.findByCandidateId(candidateId);
        Set<Long> completedAssessmentIds = mySubmissions.stream()
                .map(sub -> sub.getAssessment().getId())
                .collect(Collectors.toSet());

        List<Assessment> upcomingAssessments = activeAssessments.stream()
                .filter(a -> !completedAssessmentIds.contains(a.getId()))
                .collect(Collectors.toList());

        List<CodingQuestion> activeCoding = new ArrayList<>();
        if (!appliedJobIds.isEmpty()) {
            for (Long jobId : appliedJobIds) {
                activeCoding.addAll(codingQuestionRepository.findByJobId(jobId));
            }
        }

        List<CodingQuestion> upcomingCoding = new ArrayList<>();
        for (CodingQuestion cq : activeCoding) {
            List<CodingSubmission> subs = codingSubmissionRepository.findByCodingQuestionIdAndCandidateId(cq.getId(), candidateId);
            if (subs.isEmpty()) {
                upcomingCoding.add(cq);
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("appliedJobsCount", appliedJobsCount);
        stats.put("upcomingInterviewsCount", myInterviews.size());
        stats.put("upcomingAssessmentsCount", upcomingAssessments.size());
        stats.put("upcomingCodingCount", upcomingCoding.size());
        
        // Return raw items for UI listing
        stats.put("applications", myApps.stream().map(app -> Map.of(
                "id", app.getId(),
                "jobTitle", app.getJob().getTitle(),
                "jobLocation", app.getJob().getLocation(),
                "status", app.getStatus(),
                "appliedAt", app.getAppliedAt()
        )).collect(Collectors.toList()));

        stats.put("upcomingInterviews", myInterviews.stream().map(i -> Map.of(
                "id", i.getId(),
                "jobTitle", i.getApplication().getJob().getTitle(),
                "scheduleTime", i.getScheduleTime(),
                "meetingRoomId", i.getMeetingRoomId(),
                "recruiterName", i.getRecruiter().getName()
        )).collect(Collectors.toList()));

        stats.put("upcomingAssessments", upcomingAssessments.stream().map(a -> Map.of(
                "id", a.getId(),
                "title", a.getTitle(),
                "duration", a.getDurationMinutes(),
                "jobTitle", a.getJob().getTitle()
        )).collect(Collectors.toList()));

        stats.put("upcomingCoding", upcomingCoding.stream().map(cq -> Map.of(
                "id", cq.getId(),
                "title", cq.getTitle(),
                "difficulty", cq.getDifficulty(),
                "jobTitle", cq.getJob().getTitle()
        )).collect(Collectors.toList()));

        return ResponseEntity.ok(stats);
    }
}

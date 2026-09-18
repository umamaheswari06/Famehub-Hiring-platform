package com.hiring.service;

import com.hiring.dto.FeedbackDto;
import com.hiring.dto.InterviewDto;
import com.hiring.exception.ResourceNotFoundException;
import com.hiring.model.*;
import com.hiring.repository.ApplicationRepository;
import com.hiring.repository.InterviewFeedbackRepository;
import com.hiring.repository.InterviewRepository;
import com.hiring.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private InterviewFeedbackRepository interviewFeedbackRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Interview scheduleInterview(InterviewDto dto) {
        log.info("Scheduling interview for application ID: {} with recruiter ID: {}", dto.getApplicationId(), dto.getRecruiterId());

        Application application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + dto.getApplicationId()));

        User recruiter = userRepository.findById(dto.getRecruiterId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found with id: " + dto.getRecruiterId()));

        String uniqueRoomId = "famehub-" + UUID.randomUUID().toString().substring(0, 13);

        Interview interview = Interview.builder()
                .application(application)
                .recruiter(recruiter)
                .scheduleTime(dto.getScheduleTime())
                .meetingRoomId(uniqueRoomId)
                .status("SCHEDULED")
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        if (!application.getStatus().equals("INTERVIEW")) {
            application.setStatus("INTERVIEW");
            applicationRepository.save(application);
        }

        log.info("Successfully scheduled interview ID: {} with Jitsi room ID: {}", savedInterview.getId(), uniqueRoomId);
        notificationService.sendInterviewScheduleAlert(savedInterview);

        return savedInterview;
    }

    @Transactional
    public InterviewFeedback submitFeedback(FeedbackDto dto) {
        log.info("Submitting feedback for interview ID: {} by reviewer ID: {}", dto.getInterviewId(), dto.getReviewerId());

        Interview interview = interviewRepository.findById(dto.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview record not found with id: " + dto.getInterviewId()));

        User reviewer = userRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found with id: " + dto.getReviewerId()));

        InterviewFeedback feedback = InterviewFeedback.builder()
                .interview(interview)
                .reviewer(reviewer)
                .rating(dto.getRating())
                .feedbackText(dto.getFeedbackText())
                .recommendation(dto.getRecommendation().toUpperCase())
                .build();

        InterviewFeedback savedFeedback = interviewFeedbackRepository.save(feedback);

        interview.setStatus("COMPLETED");
        interviewRepository.save(interview);

        Application app = interview.getApplication();
        String recommendation = savedFeedback.getRecommendation();
        log.info("Interview ID {} completed. Recommendation: {}", interview.getId(), recommendation);

        if (recommendation.equalsIgnoreCase("HIRE")) {
            app.setStatus("OFFERED");
            applicationRepository.save(app);
            notificationService.sendStatusChangeAlert(app);
        } else if (recommendation.equalsIgnoreCase("REJECT")) {
            app.setStatus("REJECTED");
            applicationRepository.save(app);
            notificationService.sendStatusChangeAlert(app);
        }

        return savedFeedback;
    }

    public List<InterviewDto> getInterviewsByCandidate(Long candidateId) {
        return interviewRepository.findByApplicationCandidateId(candidateId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InterviewDto> getInterviewsByRecruiter(Long recruiterId) {
        return interviewRepository.findByRecruiterId(recruiterId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InterviewDto> getInterviewsByApplication(Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InterviewDto> getAllInterviews() {
        return interviewRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FeedbackDto> getFeedbackForInterview(Long interviewId) {
        return interviewFeedbackRepository.findByInterviewId(interviewId).stream()
                .map(f -> FeedbackDto.builder()
                        .id(f.getId())
                        .interviewId(f.getInterview().getId())
                        .reviewerId(f.getReviewer().getId())
                        .reviewerName(f.getReviewer().getName())
                        .rating(f.getRating())
                        .feedbackText(f.getFeedbackText())
                        .recommendation(f.getRecommendation())
                        .build())
                .collect(Collectors.toList());
    }

    private InterviewDto convertToDto(Interview interview) {
        return InterviewDto.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .jobTitle(interview.getApplication().getJob().getTitle())
                .candidateName(interview.getApplication().getCandidate().getName())
                .candidateEmail(interview.getApplication().getCandidate().getEmail())
                .recruiterId(interview.getRecruiter().getId())
                .recruiterName(interview.getRecruiter().getName())
                .scheduleTime(interview.getScheduleTime())
                .meetingRoomId(interview.getMeetingRoomId())
                .status(interview.getStatus())
                .build();
    }
}

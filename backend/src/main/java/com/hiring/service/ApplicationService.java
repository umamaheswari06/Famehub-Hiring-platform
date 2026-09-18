package com.hiring.service;

import com.hiring.dto.ApplicationDto;
import com.hiring.exception.BadRequestException;
import com.hiring.exception.ConflictException;
import com.hiring.exception.ResourceNotFoundException;
import com.hiring.model.Application;
import com.hiring.model.Job;
import com.hiring.model.Resume;
import com.hiring.model.User;
import com.hiring.repository.ApplicationRepository;
import com.hiring.repository.JobRepository;
import com.hiring.repository.ResumeRepository;
import com.hiring.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Application applyToJob(Long jobId, Long candidateId, Long resumeId) {
        log.info("Candidate ID {} is applying for job ID {}", candidateId, jobId);

        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            log.warn("Candidate {} has already applied for job {}", candidateId, jobId);
            throw new ConflictException("You have already applied for this job!");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + candidateId));

        Resume resume = null;
        if (resumeId != null) {
            resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
            if (!resume.getUser().getId().equals(candidateId)) {
                log.warn("Security alert: Resume {} does not belong to candidate {}", resumeId, candidateId);
                throw new BadRequestException("Resume does not belong to the candidate!");
            }
        }

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resume(resume)
                .status("APPLIED")
                .build();

        Application savedApp = applicationRepository.save(application);
        log.info("Successfully created application ID {} for candidate {}", savedApp.getId(), candidateId);

        notificationService.sendJobApplicationAlert(savedApp);

        return savedApp;
    }

    @Transactional
    public Application updateApplicationStatus(Long applicationId, String status) {
        log.info("Updating status of application ID {} to {}", applicationId, status);

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        String oldStatus = application.getStatus();
        String newStatus = status.toUpperCase();
        application.setStatus(newStatus);
        Application updatedApp = applicationRepository.save(application);

        if (!oldStatus.equalsIgnoreCase(newStatus)) {
            log.info("Application ID {} status changed from {} to {}", applicationId, oldStatus, newStatus);
            notificationService.sendStatusChangeAlert(updatedApp);
        }

        return updatedApp;
    }

    public List<ApplicationDto> getApplicationsByCandidate(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ApplicationDto> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ApplicationDto getApplicationById(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        return convertToDto(app);
    }

    public List<ApplicationDto> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ApplicationDto convertToDto(Application app) {
        return ApplicationDto.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .candidateId(app.getCandidate().getId())
                .candidateName(app.getCandidate().getName())
                .candidateEmail(app.getCandidate().getEmail())
                .resumeId(app.getResume() != null ? app.getResume().getId() : null)
                .resumeName(app.getResume() != null ? app.getResume().getFileName() : null)
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}

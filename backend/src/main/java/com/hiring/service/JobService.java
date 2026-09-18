package com.hiring.service;

import com.hiring.dto.JobDto;
import com.hiring.exception.ResourceNotFoundException;
import com.hiring.model.Department;
import com.hiring.model.Job;
import com.hiring.model.User;
import com.hiring.repository.DepartmentRepository;
import com.hiring.repository.JobRepository;
import com.hiring.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Job createJob(JobDto dto, Long recruiterId) {
        log.info("Creating new job: '{}' by recruiter ID: {}", dto.getTitle(), recruiterId);

        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found with id: " + recruiterId));

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        Job job = Job.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .salaryRange(dto.getSalaryRange())
                .type(dto.getType())
                .status("OPEN")
                .department(department)
                .createdBy(recruiter)
                .build();

        Job savedJob = jobRepository.save(job);
        log.info("Successfully created job ID: {} with title: {}", savedJob.getId(), savedJob.getTitle());
        return savedJob;
    }

    @Transactional
    public Job updateJob(Long jobId, JobDto dto) {
        log.info("Updating job ID: {}", jobId);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setSalaryRange(dto.getSalaryRange());
        job.setType(dto.getType());
        job.setDepartment(department);
        if (dto.getStatus() != null) {
            job.setStatus(dto.getStatus());
        }

        Job updatedJob = jobRepository.save(job);
        log.info("Successfully updated job ID: {}", updatedJob.getId());
        return updatedJob;
    }

    @Transactional
    public Job closeJob(Long jobId) {
        log.info("Closing job ID: {}", jobId);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        job.setStatus("CLOSED");

        Job closedJob = jobRepository.save(job);
        log.info("Successfully closed job ID: {}", closedJob.getId());
        return closedJob;
    }

    @Transactional
    public void deleteJob(Long jobId) {
        log.info("Deleting job ID: {}", jobId);

        if (!jobRepository.existsById(jobId)) {
            log.warn("Attempted to delete non-existent job ID: {}", jobId);
            throw new ResourceNotFoundException("Job not found with id: " + jobId);
        }
        jobRepository.deleteById(jobId);
        log.info("Successfully deleted job ID: {}", jobId);
    }

    public List<JobDto> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<JobDto> getOpenJobs() {
        return jobRepository.findByStatus("OPEN").stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public JobDto getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return convertToDto(job);
    }

    public JobDto convertToDto(Job job) {
        return JobDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .salaryRange(job.getSalaryRange())
                .type(job.getType())
                .status(job.getStatus())
                .departmentId(job.getDepartment() != null ? job.getDepartment().getId() : null)
                .departmentName(job.getDepartment() != null ? job.getDepartment().getName() : null)
                .build();
    }
}

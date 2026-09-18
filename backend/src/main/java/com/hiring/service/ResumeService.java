package com.hiring.service;

import com.hiring.exception.BadRequestException;
import com.hiring.exception.ResourceNotFoundException;
import com.hiring.model.Resume;
import com.hiring.model.User;
import com.hiring.repository.ResumeRepository;
import com.hiring.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ResumeService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Resume uploadResume(Long userId, MultipartFile file) throws IOException {
        log.info("Uploading resume for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            log.warn("Invalid file format uploaded: {}", contentType);
            throw new BadRequestException("Only PDF and DOCX files are supported!");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName != null && originalFileName.contains(".") 
                ? originalFileName.substring(originalFileName.lastIndexOf(".")) : "";
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = uploadPath.resolve(uniqueFileName);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Resume resume = Resume.builder()
                .user(user)
                .fileName(originalFileName)
                .filePath(targetLocation.toString())
                .fileType(contentType)
                .build();

        Resume savedResume = resumeRepository.save(resume);
        log.info("Successfully uploaded resume ID: {} for user ID: {}", savedResume.getId(), userId);
        return savedResume;
    }

    public List<Resume> getResumesByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    public Resume getResumeById(Long id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));
    }

    public Resource loadResumeAsResource(Long id) {
        log.info("Loading resume resource for ID: {}", id);
        Resume resume = getResumeById(id);
        try {
            Path filePath = Paths.get(resume.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Resume file not found on disk: " + resume.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Resume file path is invalid: " + resume.getFileName(), ex);
        }
    }

    @Transactional
    public void deleteResume(Long id) {
        log.info("Deleting resume ID: {}", id);
        Resume resume = getResumeById(id);
        
        try {
            Files.deleteIfExists(Paths.get(resume.getFilePath()));
        } catch (IOException e) {
            log.error("Failed to delete resume file from disk: {}", e.getMessage());
        }

        resumeRepository.delete(resume);
        log.info("Successfully deleted resume ID: {} from DB and disk", id);
    }
}

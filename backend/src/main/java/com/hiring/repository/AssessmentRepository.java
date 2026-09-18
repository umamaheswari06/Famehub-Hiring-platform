package com.hiring.repository;

import com.hiring.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByJobId(Long jobId);
    List<Assessment> findByStatus(String status);
}

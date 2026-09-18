package com.hiring.repository;

import com.hiring.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByCandidateId(Long candidateId);
    List<Submission> findByAssessmentId(Long assessmentId);
    Optional<Submission> findByAssessmentIdAndCandidateId(Long assessmentId, Long candidateId);
}

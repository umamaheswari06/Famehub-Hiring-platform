package com.hiring.repository;

import com.hiring.model.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    List<CodingSubmission> findByCandidateId(Long candidateId);
    List<CodingSubmission> findByCodingQuestionId(Long codingQuestionId);
    List<CodingSubmission> findByCodingQuestionIdAndCandidateId(Long codingQuestionId, Long candidateId);
}

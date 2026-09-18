package com.hiring.repository;

import com.hiring.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationCandidateId(Long candidateId);
    List<Interview> findByRecruiterId(Long recruiterId);
    List<Interview> findByApplicationId(Long applicationId);
}

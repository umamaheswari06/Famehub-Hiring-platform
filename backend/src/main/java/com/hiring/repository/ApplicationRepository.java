package com.hiring.repository;

import com.hiring.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobId(Long jobId);
    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);
}

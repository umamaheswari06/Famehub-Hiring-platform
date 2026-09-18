package com.hiring.repository;

import com.hiring.model.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    List<InterviewFeedback> findByInterviewId(Long interviewId);
}

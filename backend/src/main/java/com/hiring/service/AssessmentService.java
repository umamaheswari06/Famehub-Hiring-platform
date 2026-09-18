package com.hiring.service;

import com.hiring.dto.*;
import com.hiring.exception.BadRequestException;
import com.hiring.exception.ConflictException;
import com.hiring.exception.ResourceNotFoundException;
import com.hiring.model.*;
import com.hiring.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Transactional
    public Assessment createAssessment(AssessmentDto dto) {
        log.info("Creating new MCQ assessment: '{}' for Job ID: {}", dto.getTitle(), dto.getJobId());

        Job job = jobRepository.findById(dto.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + dto.getJobId()));

        Assessment assessment = Assessment.builder()
                .job(job)
                .title(dto.getTitle())
                .durationMinutes(dto.getDurationMinutes() > 0 ? dto.getDurationMinutes() : 30)
                .passingScore(dto.getPassingScore() > 0 ? dto.getPassingScore() : 50.0)
                .negativeMarkingFactor(dto.getNegativeMarkingFactor())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();

        Assessment saved = assessmentRepository.save(assessment);

        if (dto.getQuestions() != null) {
            for (QuestionDto qDto : dto.getQuestions()) {
                Question question = Question.builder()
                        .assessment(saved)
                        .questionText(qDto.getQuestionText())
                        .points(qDto.getPoints() > 0 ? qDto.getPoints() : 1)
                        .type(qDto.getType() != null ? qDto.getType() : "SINGLE_CHOICE")
                        .build();

                List<Option> options = new ArrayList<>();
                if (qDto.getOptions() != null) {
                    for (OptionDto oDto : qDto.getOptions()) {
                        options.add(Option.builder()
                                .question(question)
                                .optionText(oDto.getOptionText())
                                .correct(oDto.isCorrect())
                                .build());
                    }
                }
                question.setOptions(options);
                questionRepository.save(question);
            }
        }
        log.info("Successfully created MCQ assessment ID: {} with title: {}", saved.getId(), saved.getTitle());
        return saved;
    }

    @Transactional
    public CodingQuestion createCodingQuestion(CodingQuestionDto dto) {
        log.info("Creating new coding challenge: '{}' for Job ID: {}", dto.getTitle(), dto.getJobId());

        Job job = jobRepository.findById(dto.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + dto.getJobId()));

        CodingQuestion cq = CodingQuestion.builder()
                .job(job)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .constraints(dto.getConstraints())
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : "MEDIUM")
                .templateJava(dto.getTemplateJava())
                .templatePython(dto.getTemplatePython())
                .templateCpp(dto.getTemplateCpp())
                .templateJs(dto.getTemplateJs())
                .build();

        CodingQuestion saved = codingQuestionRepository.save(cq);

        if (dto.getTestCases() != null) {
            for (TestCaseDto tcDto : dto.getTestCases()) {
                TestCase tc = TestCase.builder()
                        .codingQuestion(saved)
                        .inputData(tcDto.getInputData())
                        .expectedOutput(tcDto.getExpectedOutput())
                        .hidden(tcDto.isHidden())
                        .build();
                testCaseRepository.save(tc);
            }
        }
        log.info("Successfully created coding challenge ID: {} with title: {}", saved.getId(), saved.getTitle());
        return saved;
    }

    public List<AssessmentDto> getAssessmentsForJob(Long jobId) {
        return assessmentRepository.findByJobId(jobId).stream()
                .map(this::convertToDtoSecure)
                .collect(Collectors.toList());
    }

    public AssessmentDto getAssessmentByIdSecure(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));
        return convertToDtoSecure(assessment);
    }

    public AssessmentDto getAssessmentByIdFull(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));
        return convertToDtoFull(assessment);
    }

    public List<AssessmentDto> getAllAssessments() {
        List<AssessmentDto> mcqs = assessmentRepository.findAll().stream()
                .map(this::convertToDtoFull)
                .collect(Collectors.toList());
        mcqs.forEach(dto -> dto.setType("MCQ"));

        List<AssessmentDto> coding = codingQuestionRepository.findAll().stream()
                .map(cq -> AssessmentDto.builder()
                        .id(cq.getId())
                        .jobId(cq.getJob() != null ? cq.getJob().getId() : null)
                        .jobTitle(cq.getJob() != null ? cq.getJob().getTitle() : null)
                        .title(cq.getTitle())
                        .durationMinutes(45)
                        .passingScore(100.0)
                        .negativeMarkingFactor(0.0)
                        .status("ACTIVE")
                        .type("CODING")
                        .questions(new ArrayList<>())
                        .build())
                .collect(Collectors.toList());

        List<AssessmentDto> all = new ArrayList<>();
        all.addAll(mcqs);
        all.addAll(coding);
        return all;
    }

    @Transactional
    public Submission startAssessment(Long assessmentId, Long candidateId) {
        log.info("Candidate ID {} is starting assessment ID {}", candidateId, assessmentId);

        Optional<Submission> existing = submissionRepository.findByAssessmentIdAndCandidateId(assessmentId, candidateId);
        if (existing.isPresent()) {
            log.info("Candidate ID {} has an existing submission record with status {}", candidateId, existing.get().getStatus());
            return existing.get();
        }

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + assessmentId));
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + candidateId));

        Submission submission = Submission.builder()
                .assessment(assessment)
                .candidate(candidate)
                .status("STARTED")
                .score(0.0)
                .tabSwitches(0)
                .copyPasteDetects(0)
                .build();

        return submissionRepository.save(submission);
    }

    @Transactional
    public void trackAntiCheatingActivity(Long assessmentId, Long candidateId, int tabSwitches, int copyPasteDetects) {
        log.debug("Tracking activity for candidate {} in assessment {}: tabSwitches={}, copyPasteDetects={}", 
                candidateId, assessmentId, tabSwitches, copyPasteDetects);

        Submission submission = submissionRepository.findByAssessmentIdAndCandidateId(assessmentId, candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission record not found, start assessment first!"));
        
        submission.setTabSwitches(submission.getTabSwitches() + tabSwitches);
        submission.setCopyPasteDetects(submission.getCopyPasteDetects() + copyPasteDetects);
        submissionRepository.save(submission);
    }

    @Transactional
    public SubmitMcqResponse submitMcqAssessment(SubmitMcqRequest request, Long candidateId) {
        log.info("Submitting MCQ assessment ID {} for candidate {}", request.getAssessmentId(), candidateId);

        Submission submission = submissionRepository.findByAssessmentIdAndCandidateId(request.getAssessmentId(), candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission record not found, start assessment first!"));

        if ("COMPLETED".equals(submission.getStatus())) {
            log.warn("Candidate {} attempted to re-submit assessment {}", candidateId, request.getAssessmentId());
            throw new ConflictException("Assessment already submitted!");
        }

        Assessment assessment = submission.getAssessment();
        List<Question> questions = questionRepository.findByAssessmentId(assessment.getId());

        double totalPoints = 0;
        double earnedPoints = 0;

        for (Question question : questions) {
            totalPoints += question.getPoints();

            List<Long> candidateSelectedOptionIds = request.getAnswers().get(question.getId());
            if (candidateSelectedOptionIds == null || candidateSelectedOptionIds.isEmpty()) {
                continue;
            }

            List<Long> correctOptionIds = question.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(Option::getId)
                    .collect(Collectors.toList());

            if (new HashSet<>(correctOptionIds).equals(new HashSet<>(candidateSelectedOptionIds))) {
                earnedPoints += question.getPoints();
            } else {
                if (assessment.getNegativeMarkingFactor() > 0) {
                    earnedPoints -= (question.getPoints() * assessment.getNegativeMarkingFactor());
                }
            }
        }

        double percentageScore = (earnedPoints / totalPoints) * 100.0;
        if (percentageScore < 0) percentageScore = 0.0;

        submission.setScore(percentageScore);
        submission.setStatus("COMPLETED");
        submission.setCompletedAt(LocalDateTime.now());
        submission.setTabSwitches(submission.getTabSwitches() + request.getTabSwitches());
        submission.setCopyPasteDetects(submission.getCopyPasteDetects() + request.getCopyPasteDetects());

        Submission savedSub = submissionRepository.save(submission);
        boolean passed = percentageScore >= assessment.getPassingScore();

        log.info("MCQ assessment ID {} completed by candidate {}. Score: {}%, Passed: {}", 
                assessment.getId(), candidateId, percentageScore, passed);

        notificationService.sendAssessmentResultAlert(savedSub, passed);

        if (assessment.getJob() != null) {
            applicationRepository.findByCandidateId(candidateId).stream()
                .filter(app -> app.getJob().getId().equals(assessment.getJob().getId()))
                .filter(app -> app.getStatus().equalsIgnoreCase("ASSESSMENT") || app.getStatus().equalsIgnoreCase("SCREENING"))
                .findFirst()
                .ifPresent(app -> {
                    String newStatus = passed ? "INTERVIEW" : "REJECTED";
                    app.setStatus(newStatus);
                    applicationRepository.save(app);
                    notificationService.sendStatusChangeAlert(app);
                });
        }

        return SubmitMcqResponse.builder()
                .submissionId(savedSub.getId())
                .score(percentageScore)
                .status(savedSub.getStatus())
                .passed(passed)
                .tabSwitches(savedSub.getTabSwitches())
                .copyPasteDetects(savedSub.getCopyPasteDetects())
                .build();
    }

    // Helper: secure map (hides answer keys)
    private AssessmentDto convertToDtoSecure(Assessment assessment) {
        List<Question> questions = questionRepository.findByAssessmentId(assessment.getId());
        List<QuestionDto> qDtos = questions.stream().map(q -> QuestionDto.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .points(q.getPoints())
                .type(q.getType())
                .options(q.getOptions().stream().map(o -> OptionDto.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .correct(false) // Security: Hide correctness
                        .build()).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());

        return AssessmentDto.builder()
                .id(assessment.getId())
                .jobId(assessment.getJob() != null ? assessment.getJob().getId() : null)
                .jobTitle(assessment.getJob() != null ? assessment.getJob().getTitle() : null)
                .title(assessment.getTitle())
                .durationMinutes(assessment.getDurationMinutes())
                .passingScore(assessment.getPassingScore())
                .negativeMarkingFactor(assessment.getNegativeMarkingFactor())
                .status(assessment.getStatus())
                .type("MCQ")
                .questions(qDtos)
                .build();
    }

    // Helper: HR full map (keeps answer keys)
    private AssessmentDto convertToDtoFull(Assessment assessment) {
        List<Question> questions = questionRepository.findByAssessmentId(assessment.getId());
        List<QuestionDto> qDtos = questions.stream().map(q -> QuestionDto.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .points(q.getPoints())
                .type(q.getType())
                .options(q.getOptions().stream().map(o -> OptionDto.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .correct(o.isCorrect()) // Display correctness to recruiter
                        .build()).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());

        return AssessmentDto.builder()
                .id(assessment.getId())
                .jobId(assessment.getJob() != null ? assessment.getJob().getId() : null)
                .jobTitle(assessment.getJob() != null ? assessment.getJob().getTitle() : null)
                .title(assessment.getTitle())
                .durationMinutes(assessment.getDurationMinutes())
                .passingScore(assessment.getPassingScore())
                .negativeMarkingFactor(assessment.getNegativeMarkingFactor())
                .status(assessment.getStatus())
                .type("MCQ")
                .questions(qDtos)
                .build();
    }
}

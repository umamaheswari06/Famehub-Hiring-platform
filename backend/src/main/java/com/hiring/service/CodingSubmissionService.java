package com.hiring.service;

import com.hiring.client.Judge0Client;
import com.hiring.dto.CodingSubmissionRequest;
import com.hiring.dto.CodingSubmissionResponse;
import com.hiring.exception.BadRequestException;
import com.hiring.exception.ResourceNotFoundException;
import com.hiring.model.*;
import com.hiring.repository.ApplicationRepository;
import com.hiring.repository.CodingQuestionRepository;
import com.hiring.repository.CodingSubmissionRepository;
import com.hiring.repository.TestCaseRepository;
import com.hiring.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CodingSubmissionService {

    @Autowired
    private CodingSubmissionRepository codingSubmissionRepository;

    @Autowired
    private AiTutorService aiTutorService;

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Judge0Client judge0Client;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${judge0.language-ids.java:62}")
    private int javaLangId;

    @Value("${judge0.language-ids.python:71}")
    private int pythonLangId;

    @Value("${judge0.language-ids.cpp:54}")
    private int cppLangId;

    @Value("${judge0.language-ids.javascript:63}")
    private int jsLangId;

    @Transactional
    public CodingSubmissionResponse evaluateSubmission(CodingSubmissionRequest request, Long candidateId) {
        log.info("Evaluating coding submission for question ID: {} from candidate ID: {}", request.getCodingQuestionId(), candidateId);

        CodingQuestion question = codingQuestionRepository.findById(request.getCodingQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Coding challenge not found with id: " + request.getCodingQuestionId()));

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + candidateId));

        List<TestCase> testCases = testCaseRepository.findByCodingQuestionId(question.getId());
        if (testCases.isEmpty()) {
            log.warn("No test cases defined for question ID: {}", question.getId());
            throw new BadRequestException("No test cases defined for this question!");
        }

        int langId = getLanguageId(request.getLanguage());
        String wrappedCode = wrapSourceCode(request.getSourceCode(), request.getLanguage(), question.getId());
        int passedCount = 0;
        double maxTime = 0.0;
        long maxMemory = 0;
        String finalStatus = "ACCEPTED";
        String firstErrorMessage = null;
        String lastToken = null;
        List<CodingSubmissionResponse.TestCaseResult> tcResults = new java.util.ArrayList<>();

        log.info("Submitting {} test cases to Judge0 compiler sandbox for evaluation", testCases.size());

        for (TestCase tc : testCases) {
            String token = judge0Client.submitCode(wrappedCode, langId, tc.getInputData(), tc.getExpectedOutput());
            if (token == null) {
                log.error("Failed to connect to the Judge0 sandbox compiler");
                throw new BadRequestException("Failed to reach compiler sandbox. Please try again.");
            }
            lastToken = token;

            Judge0Client.Judge0ResultResponse result = pollSubmission(token);
            if (result == null) {
                log.warn("Sandbox poll timed out or failed for token: {}", token);
                finalStatus = "SANDBOX_ERROR";
                firstErrorMessage = "Sandbox timed out or failed to return metrics.";
                tcResults.add(CodingSubmissionResponse.TestCaseResult.builder()
                        .testCaseId(tc.getId())
                        .input(tc.getInputData())
                        .expectedOutput(tc.getExpectedOutput())
                        .actualOutput("")
                        .passed(false)
                        .hidden(tc.isHidden())
                        .status("SANDBOX_ERROR")
                        .executionTime(0.0)
                        .memoryUsage(0L)
                        .build());
                break;
            }

            double tcTime = 0.0;
            if (result.getTime() != null) {
                try {
                    double t = Double.parseDouble(result.getTime());
                    tcTime = t;
                    if (t > maxTime) maxTime = t;
                } catch (NumberFormatException ignored) {}
            }
            long tcMemory = 0;
            if (result.getMemory() != null) {
                tcMemory = result.getMemory();
                if (tcMemory > maxMemory) maxMemory = tcMemory;
            }

            int statusId = result.getStatus().getId();
            boolean passed = (statusId == 3);
            if (passed) {
                passedCount++;
            } else {
                if (firstErrorMessage == null) {
                    finalStatus = mapStatusIdToString(statusId);
                    if (result.getCompile_output() != null) {
                        firstErrorMessage = result.getCompile_output();
                    } else if (result.getStderr() != null) {
                        firstErrorMessage = result.getStderr();
                    } else {
                        firstErrorMessage = "Expected output: " + tc.getExpectedOutput() + ", but got: " + result.getStdout();
                    }
                }
            }

            String actualOut = result.getStdout() != null ? result.getStdout().trim() : "";
            tcResults.add(CodingSubmissionResponse.TestCaseResult.builder()
                    .testCaseId(tc.getId())
                    .input(tc.getInputData())
                    .expectedOutput(tc.getExpectedOutput())
                    .actualOutput(actualOut)
                    .passed(passed)
                    .hidden(tc.isHidden())
                    .status(mapStatusIdToString(statusId))
                    .executionTime(tcTime)
                    .memoryUsage(tcMemory)
                    .build());
        }

        double finalScore = ((double) passedCount / testCases.size()) * 100.0;
        if (finalScore == 100.0 && passedCount > 0) {
            finalStatus = "ACCEPTED";
        } else if (firstErrorMessage != null && finalStatus.equals("ACCEPTED")) {
            finalStatus = "FAILED";
        }

        log.info("Candidate ID {} achieved score {}% on coding challenge ID {}. Final status: {}", 
                candidateId, finalScore, question.getId(), finalStatus);

        String journeyReport = "";
        try {
            journeyReport = aiTutorService.getJourneyAnalysis(
                question.getTitle(),
                question.getDescription(),
                request.getSourceCode(),
                request.getLanguage(),
                request.getJourneyEvents()
            );
        } catch (Exception e) {
            log.error("Failed to generate candidate cognitive journey analysis: {}", e.getMessage());
            journeyReport = "### ⚠️ Cognitive Analysis Generation Failed\n" + e.getMessage();
        }

        CodingSubmission submission = CodingSubmission.builder()
                .codingQuestion(question)
                .candidate(candidate)
                .sourceCode(request.getSourceCode())
                .language(request.getLanguage())
                .status(finalStatus)
                .score(finalScore)
                .executionTime(maxTime)
                .memoryUsage(maxMemory)
                .token(lastToken)
                .errorMessage(firstErrorMessage)
                .cognitiveJourneyReport(journeyReport)
                .build();

        CodingSubmission savedSubmission = codingSubmissionRepository.save(submission);

        boolean allPassed = "ACCEPTED".equals(finalStatus);
        int finalPassedCount = passedCount;
        int totalCases = testCases.size();

        notificationService.sendCodingResultAlert(
                candidate, question.getTitle(), finalPassedCount, totalCases, allPassed);

        if (question.getJob() != null) {
            applicationRepository.findByCandidateId(candidateId).stream()
                .filter(app -> app.getJob().getId().equals(question.getJob().getId()))
                .filter(app -> app.getStatus().equalsIgnoreCase("ASSESSMENT") || app.getStatus().equalsIgnoreCase("SCREENING"))
                .findFirst()
                .ifPresent(app -> {
                    String newStatus = allPassed ? "INTERVIEW" : "REJECTED";
                    app.setStatus(newStatus);
                    applicationRepository.save(app);
                    notificationService.sendStatusChangeAlert(app);
                });
        }

        return CodingSubmissionResponse.builder()
                .submissionId(savedSubmission.getId())
                .status(finalStatus)
                .executionTime(maxTime)
                .memoryUsage(maxMemory)
                .score(finalScore)
                .errorMessage(firstErrorMessage)
                .cognitiveJourneyReport(savedSubmission.getCognitiveJourneyReport())
                .testCaseResults(tcResults)
                .build();
    }

    private Judge0Client.Judge0ResultResponse pollSubmission(String token) {
        int attempts = 0;
        while (attempts < 15) {
            Judge0Client.Judge0ResultResponse response = judge0Client.getSubmissionResult(token);
            if (response != null && response.getStatus() != null) {
                int id = response.getStatus().getId();
                if (id != 1 && id != 2) { // Not in Queue and not Processing
                    return response;
                }
            }
            try {
                Thread.sleep(600);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
            attempts++;
        }
        return null;
    }

    public List<CodingSubmissionResponse> getSubmissionsByCandidate(Long candidateId) {
        return codingSubmissionRepository.findByCandidateId(candidateId).stream()
                .map(sub -> CodingSubmissionResponse.builder()
                        .submissionId(sub.getId())
                        .status(sub.getStatus())
                        .executionTime(sub.getExecutionTime())
                        .memoryUsage(sub.getMemoryUsage())
                        .score(sub.getScore())
                        .errorMessage(sub.getErrorMessage())
                        .cognitiveJourneyReport(sub.getCognitiveJourneyReport())
                        .build())
                .collect(Collectors.toList());
    }

    private int getLanguageId(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> javaLangId;
            case "python", "python3" -> pythonLangId;
            case "cpp", "c++" -> cppLangId;
            case "javascript", "js", "node" -> jsLangId;
            default -> throw new IllegalArgumentException("Unsupported sandbox language: " + language);
        };
    }

    private String mapStatusIdToString(int statusId) {
        return switch (statusId) {
            case 3 -> "ACCEPTED";
            case 4 -> "WRONG_ANSWER";
            case 5 -> "TIME_LIMIT_EXCEEDED";
            case 6 -> "COMPILATION_ERROR";
            case 7, 8, 9, 10, 11, 12 -> "RUNTIME_ERROR";
            default -> "UNKNOWN_ERROR";
        };
    }

    private String wrapSourceCode(String sourceCode, String language, Long questionId) {
        if (questionId != 1) {
            return sourceCode;
        }
        
        switch (language.toLowerCase()) {
            case "java":
                String cleanJava = sourceCode.replace("public class Solution", "class Solution");
                return "class ListNode {\n" +
                       "    int val;\n" +
                       "    ListNode next;\n" +
                       "    ListNode() {}\n" +
                       "    ListNode(int val) { this.val = val; }\n" +
                       "    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n" +
                       "}\n\n" +
                       cleanJava + "\n\n" +
                       "public class Main {\n" +
                       "    public static void main(String[] args) {\n" +
                       "        java.util.Scanner sc = new java.util.Scanner(System.in);\n" +
                       "        if (!sc.hasNextLine()) return;\n" +
                       "        String line = sc.nextLine().trim();\n" +
                       "        if (line.isEmpty()) return;\n" +
                       "        String[] parts = line.split(\"\\\\s+\");\n" +
                       "        ListNode dummy = new ListNode(0);\n" +
                       "        ListNode curr = dummy;\n" +
                       "        for (String part : parts) {\n" +
                       "            curr.next = new ListNode(Integer.parseInt(part));\n" +
                       "            curr = curr.next;\n" +
                       "        }\n" +
                       "        Solution solver = new Solution();\n" +
                       "        ListNode reversed = solver.reverseList(dummy.next);\n" +
                       "        StringBuilder sb = new StringBuilder();\n" +
                       "        while (reversed != null) {\n" +
                       "            sb.append(reversed.val);\n" +
                       "            if (reversed.next != null) sb.append(\" \");\n" +
                       "            reversed = reversed.next;\n" +
                       "        }\n" +
                       "        System.out.print(sb.toString());\n" +
                       "    }\n" +
                       "}";
                       
            case "python":
            case "python3":
                return "class ListNode:\n" +
                       "    def __init__(self, val=0, next=None):\n" +
                       "        self.val = val\n" +
                       "        self.next = next\n\n" +
                       sourceCode + "\n\n" +
                       "import sys\n" +
                       "def main():\n" +
                       "    line = sys.stdin.read().strip()\n" +
                       "    if not line: return\n" +
                       "    parts = line.split()\n" +
                       "    dummy = ListNode(0)\n" +
                       "    curr = dummy\n" +
                       "    for part in parts:\n" +
                       "        curr.next = ListNode(int(part))\n" +
                       "        curr = curr.next\n" +
                       "    reversed_head = reverseList(dummy.next)\n" +
                       "    res = []\n" +
                       "    curr = reversed_head\n" +
                       "    while curr:\n" +
                       "        res.append(str(curr.val))\n" +
                       "        curr = curr.next\n" +
                       "    print(\" \".join(res), end=\"\")\n" +
                       "if __name__ == '__main__':\n" +
                       "    main()";
                       
            case "cpp":
            case "c++":
                return "#include <iostream>\n" +
                       "#include <vector>\n" +
                       "#include <string>\n" +
                       "#include <sstream>\n\n" +
                       "struct ListNode {\n" +
                       "    int val;\n" +
                       "    ListNode* next;\n" +
                       "    ListNode() : val(0), next(nullptr) {}\n" +
                       "    ListNode(int x) : val(x), next(nullptr) {}\n" +
                       "    ListNode(int x, ListNode* next) : val(x), next(next) {}\n" +
                       "};\n\n" +
                       sourceCode + "\n\n" +
                       "int main() {\n" +
                       "    std::string line;\n" +
                       "    if (std::getline(std::cin, line)) {\n" +
                       "        std::stringstream ss(line);\n" +
                       "        int val;\n" +
                       "        ListNode* dummy = new ListNode(0);\n" +
                       "        ListNode* curr = dummy;\n" +
                       "        while (ss >> val) {\n" +
                       "            curr->next = new ListNode(val);\n" +
                       "            curr = curr->next;\n" +
                       "        }\n" +
                       "        ListNode* reversed = reverseList(dummy->next);\n" +
                       "        ListNode* temp = reversed;\n" +
                       "        bool first = true;\n" +
                       "        while (temp != nullptr) {\n" +
                       "            if (!first) std::cout << \" \";\n" +
                       "            std::cout << temp->val;\n" +
                       "            first = false;\n" +
                       "            temp = temp->next;\n" +
                       "        }\n" +
                       "    }\n" +
                       "    return 0;\n" +
                       "}";
                       
            case "javascript":
            case "js":
            case "node":
                return "class ListNode {\n" +
                       "    constructor(val = 0, next = null) {\n" +
                       "        this.val = val;\n" +
                       "        this.next = next;\n" +
                       "    }\n" +
                       "}\n\n" +
                       sourceCode + "\n\n" +
                       "const fs = require('fs');\n" +
                       "function main() {\n" +
                       "    const input = fs.readFileSync(0, 'utf-8').trim();\n" +
                       "    if (!input) return;\n" +
                       "    const parts = input.split(/\\s+/);\n" +
                       "    const dummy = new ListNode(0);\n" +
                       "    let curr = dummy;\n" +
                       "    for (const part of parts) {\n" +
                       "        curr.next = new ListNode(parseInt(part, 10));\n" +
                       "        curr = curr.next;\n" +
                       "    }\n" +
                       "    let reversed = reverseList(dummy.next);\n" +
                       "    const res = [];\n" +
                       "    while (reversed) {\n" +
                       "        res.push(reversed.val);\n" +
                       "        reversed = reversed.next;\n" +
                       "    }\n" +
                       "    process.stdout.write(res.join(\" \"));\n" +
                       "}\n" +
                       "main();";
                       
            default:
                return sourceCode;
        }
    }
}

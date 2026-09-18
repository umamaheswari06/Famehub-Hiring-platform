package com.hiring.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.hiring.dto.AiTutorRequest;
import com.hiring.dto.AiTutorResponse;
import com.hiring.dto.JourneyEventDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
@Slf4j
public class AiTutorService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiTutorResponse getFeedback(AiTutorRequest request) {
        // Fallback to environment variable if @Value properties didn't pick it up
        String apiKey = geminiApiKey;
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getenv("GEMINI_API_KEY");
        }

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is not configured. Falling back to mock responses.");
            return generateMockFeedback(request);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            // Define system instructions
            String systemInstruction = "You are an expert, encouraging online tutor and technical interviewer named \"Famehub Tutor\". " +
                    "Your role is to guide the candidate, answer questions, provide conceptual explanations, debug advice, and coding tips. " +
                    "CRITICAL: Do NOT write or provide the complete solution code directly. Focus on guiding the candidate using hints, Socratic questioning, " +
                    "clarifying logic flaws, explaining syntax, or analysing time/space complexity. Always encourage them and formatting with markdown.";

            if ("MCQ".equalsIgnoreCase(request.getType())) {
                systemInstruction = "You are an expert, encouraging tutor named \"Famehub Tutor\". " +
                        "Your role is to guide the candidate through multiple choice questions. " +
                        "CRITICAL: Do NOT tell the candidate which option is correct directly. Instead, explain the core concepts of the question, " +
                        "analyze what different options mean, guide them conceptually, and help them arrive at the correct answer on their own.";
            }

            // Build the Gemini request payload
            ObjectNode rootNode = objectMapper.createObjectNode();

            ObjectNode systemInstructionNode = objectMapper.createObjectNode();
            ArrayNode systemParts = objectMapper.createArrayNode();
            systemParts.add(objectMapper.createObjectNode().put("text", systemInstruction));
            systemInstructionNode.set("parts", systemParts);
            rootNode.set("systemInstruction", systemInstructionNode);

            ArrayNode contentsNode = objectMapper.createArrayNode();

            // Populate conversation history
            if (request.getChatHistory() != null) {
                for (AiTutorRequest.ChatMessage msg : request.getChatHistory()) {
                    ObjectNode contentItem = objectMapper.createObjectNode();
                    contentItem.put("role", "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model");
                    ArrayNode parts = objectMapper.createArrayNode();
                    parts.add(objectMapper.createObjectNode().put("text", msg.getContent()));
                    contentItem.set("parts", parts);
                    contentsNode.add(contentItem);
                }
            }

            // Append current context and candidate query
            StringBuilder currentText = new StringBuilder();
            if ("CODING".equalsIgnoreCase(request.getType())) {
                currentText.append("Assessment Details:\n")
                        .append("- Title: ").append(request.getQuestionTitle()).append("\n")
                        .append("- Description: ").append(request.getQuestionDescription()).append("\n\n");
                
                if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
                    currentText.append("My Current Code (")
                            .append(request.getLanguage() != null ? request.getLanguage() : "Text")
                            .append("):\n```")
                            .append(request.getLanguage() != null ? request.getLanguage() : "")
                            .append("\n")
                            .append(request.getCode())
                            .append("\n```\n\n");
                }
                
                if (request.getErrorMessage() != null && !request.getErrorMessage().trim().isEmpty()) {
                    currentText.append("Compiler Output/Error:\n")
                            .append(request.getErrorMessage()).append("\n\n");
                }
            } else if ("MCQ".equalsIgnoreCase(request.getType())) {
                currentText.append("Question: ").append(request.getQuestionDescription()).append("\n");
                if (request.getOptions() != null && !request.getOptions().isEmpty()) {
                    currentText.append("Options:\n");
                    for (String opt : request.getOptions()) {
                        currentText.append("- ").append(opt).append("\n");
                    }
                }
                if (request.getSelectedOption() != null && !request.getSelectedOption().trim().isEmpty()) {
                    currentText.append("\nMy current selected option: ").append(request.getSelectedOption()).append("\n");
                }
            }

            currentText.append("\nCandidate: ").append(request.getUserMessage() != null ? request.getUserMessage() : "Please review my progress and give hints.");

            ObjectNode currentContent = objectMapper.createObjectNode();
            currentContent.put("role", "user");
            ArrayNode currentParts = objectMapper.createArrayNode();
            currentParts.add(objectMapper.createObjectNode().put("text", currentText.toString()));
            currentContent.set("parts", currentParts);
            contentsNode.add(currentContent);

            rootNode.set("contents", contentsNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(rootNode), headers);

            log.info("Invoking Gemini model for request type: {}", request.getType());
            String rawResponse = restTemplate.postForObject(url, entity, String.class);
            JsonNode responseJson = objectMapper.readTree(rawResponse);

            String generatedText = "I encountered an issue generating feedback. Please try again.";
            if (responseJson.has("candidates") && responseJson.get("candidates").isArray()) {
                JsonNode candidate = responseJson.get("candidates").get(0);
                if (candidate.has("content") && candidate.get("content").has("parts")) {
                    generatedText = candidate.get("content").get("parts").get(0).get("text").asText();
                }
            }

            return new AiTutorResponse(generatedText, false);

        } catch (Exception e) {
            log.error("Error communicating with Gemini API: {}", e.getMessage(), e);
            return new AiTutorResponse("I'm sorry, I'm having trouble connecting to the AI service. Details: " + e.getMessage(), true);
        }
    }

    private AiTutorResponse generateMockFeedback(AiTutorRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("✨ **[Tutor Note: Running in Simulation Mode - No Gemini API Key configured]**\n\n");
        sb.append("Hi there! I am your AI assessment tutor. I am analyzing your submission context:\n\n");

        if ("CODING".equalsIgnoreCase(request.getType())) {
            sb.append("🔍 **Analysis of: ").append(request.getQuestionTitle()).append("**\n");
            sb.append("- **Language**: `").append(request.getLanguage() != null ? request.getLanguage() : "unknown").append("`\n");
            
            if (request.getCode() != null && request.getCode().contains("for") || request.getCode() != null && request.getCode().contains("while")) {
                sb.append("- **Observation**: I see you are using a loop. Make sure your loop boundaries are correct and terminate appropriately.\n");
            }

            if (request.getErrorMessage() != null && !request.getErrorMessage().trim().isEmpty()) {
                sb.append("- **Handling Compilation / Execution Errors**: I see you have an error output: `")
                        .append(request.getErrorMessage().length() > 60 ? request.getErrorMessage().substring(0, 60) + "..." : request.getErrorMessage())
                        .append("`. Common causes are missing syntax separators, undeclared variables, or mismatched brackets. Check line boundaries!\n");
            }

            sb.append("\n💡 **Tutor Guide & Hints**:\n");
            sb.append("1. **Understand Constraints**: Ensure you handle large inputs efficiently. Think about the time complexity (e.g., O(N) vs O(N²)).\n");
            sb.append("2. **Divide and Conquer**: Break down the problem description step-by-step. Draft helper comments before completing the implementation.\n");
            sb.append("3. **Edge Cases**: Consider inputs such as empty list, negative values, or empty strings.");
        } else {
            sb.append("🔍 **Concept Check: MCQ Question**\n");
            sb.append("You asked about: *\"").append(request.getQuestionDescription()).append("\"*\n\n");
            sb.append("💡 **Pedagogical Guidance**:\n");
            sb.append("- Carefully evaluate each option. Ask yourself what core library or design pattern is referenced in the question.\n");
            sb.append("- Eliminate options that violate fundamental rules (like syntax errors, thread safety concerns, or incorrect complexity classes).\n");
            sb.append("- Select the option that aligns closest with standard specifications.");
        }

        return new AiTutorResponse(sb.toString(), true);
    }

    public String getJourneyAnalysis(String questionTitle, String questionDescription, String finalCode, String language, List<JourneyEventDto> events) {
        String apiKey = geminiApiKey;
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getenv("GEMINI_API_KEY");
        }

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is not configured. Falling back to mock cognitive journey analysis.");
            return generateMockJourneyAnalysis(questionTitle, events);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            String systemInstruction = "You are an expert technical recruiter, cognitive scientist, and lead system architect named \"Famehub Cognitive Decoder\". " +
                    "Your role is to analyze a candidate's step-by-step coding development journey timeline and generate a detailed, premium, professional, " +
                    "and qualitative markdown report for the hiring team explaining how the candidate solves problems, handles compilation issues, " +
                    "and interacts with AI assistance. Be direct, structural, insightful, and highlight both strengths and improvement areas.";

            StringBuilder prompt = new StringBuilder();
            prompt.append("Coding Assessment Details:\n")
                    .append("- Title: ").append(questionTitle).append("\n")
                    .append("- Problem Description: ").append(questionDescription).append("\n\n")
                    .append("Candidate Final Code Submission (").append(language).append("):\n```").append(language).append("\n")
                    .append(finalCode).append("\n```\n\n")
                    .append("Development Journey Log Events:\n");

            if (events == null || events.isEmpty()) {
                prompt.append("- No events captured during the session.\n");
            } else {
                long firstTimestamp = events.get(0).getTimestamp();
                for (JourneyEventDto event : events) {
                    long sec = (event.getTimestamp() - firstTimestamp) / 1000;
                    if (sec < 0) sec = 0;
                    prompt.append(String.format("- [+%ds] Event [%s]: %s\n", sec, event.getEventType(), event.getDetails()));
                }
            }

            prompt.append("\nGenerate a comprehensive markdown assessment of the candidate based on their coding journey timeline. " +
                    "Organize your report with the following structure:\n" +
                    "### 🎯 1. Initial Logic & Strategy\n" +
                    "(Analyze how they started. Did they plan first or jump straight into coding? Did they start with simple drafts?)\n" +
                    "### 🛠️ 2. Debugging & Resilience\n" +
                    "(Did they face compile errors, wrong outputs, or run errors? How did they react? Did they fix issues systematically or make random, erratic attempts?)\n" +
                    "### 💡 3. AI Tutor Utilization\n" +
                    "(Did they use the AI tutor for general guidance, understanding requirements, debugging, or did they copy-paste requests to try and get answers?)\n" +
                    "### 📊 4. Cognitive Profile Persona\n" +
                    "(Identify their cognitive persona, e.g. 'Iterative Improver', 'Systematic Architect', 'Trial-and-Error Coder', 'AI-assisted Explorer' with a short reason.)");

            // Build the Gemini request payload
            ObjectNode rootNode = objectMapper.createObjectNode();

            ObjectNode systemInstructionNode = objectMapper.createObjectNode();
            ArrayNode systemParts = objectMapper.createArrayNode();
            systemParts.add(objectMapper.createObjectNode().put("text", systemInstruction));
            systemInstructionNode.set("parts", systemParts);
            rootNode.set("systemInstruction", systemInstructionNode);

            ArrayNode contentsNode = objectMapper.createArrayNode();
            ObjectNode contentItem = objectMapper.createObjectNode();
            contentItem.put("role", "user");
            ArrayNode parts = objectMapper.createArrayNode();
            parts.add(objectMapper.createObjectNode().put("text", prompt.toString()));
            contentItem.set("parts", parts);
            contentsNode.add(contentItem);
            rootNode.set("contents", contentsNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(rootNode), headers);

            log.info("Invoking Gemini model for cognitive journey analysis on question: {}", questionTitle);
            String rawResponse = restTemplate.postForObject(url, entity, String.class);
            JsonNode responseJson = objectMapper.readTree(rawResponse);

            String generatedText = "Unable to generate cognitive analysis.";
            if (responseJson.has("candidates") && responseJson.get("candidates").isArray()) {
                JsonNode candidate = responseJson.get("candidates").get(0);
                if (candidate.has("content") && candidate.get("content").has("parts")) {
                    generatedText = candidate.get("content").get("parts").get(0).get("text").asText();
                }
            }

            return generatedText;

        } catch (Exception e) {
            log.error("Error communicating with Gemini API for trajectory analysis: {}", e.getMessage(), e);
            return "### ⚠️ Error Generating AI Cognitive Analysis\nUnable to retrieve analysis due to a communication issue: " + e.getMessage();
        }
    }

    private String generateMockJourneyAnalysis(String title, List<JourneyEventDto> events) {
        StringBuilder sb = new StringBuilder();
        sb.append("✨ **[Tutor Note: Simulated Mode - No Gemini API Key configured]**\n\n");
        sb.append("### 🎯 1. Initial Logic & Strategy\n");
        sb.append("The candidate started with a basic template draft. The early events indicate a steady typing flow. ");
        
        sb.append("\n\n### 🛠️ 2. Debugging & Resilience\n");
        long compileFails = events == null ? 0 : events.stream().filter(e -> "COMPILE_RUN".equals(e.getEventType()) && e.getDetails() != null && e.getDetails().contains("fail")).count();
        if (compileFails > 0) {
            sb.append("The candidate encountered ").append(compileFails).append(" compilation/runtime exceptions during execution. They corrected their syntax errors iteratively. ");
        } else {
            sb.append("The candidate had a clean compilation flow with zero compilation errors, showing high syntax familiarity. ");
        }

        sb.append("\n\n### 💡 3. AI Tutor Utilization\n");
        long tutorAsks = events == null ? 0 : events.stream().filter(e -> "AI_TUTOR_ASK".equals(e.getEventType())).count();
        if (tutorAsks > 0) {
            sb.append("The candidate queried the AI Tutor ").append(tutorAsks).append(" times during the session, demonstrating an active effort to utilize the Socratic hints to debug logical bottlenecks. ");
        } else {
            sb.append("The candidate completed the coding challenge independently without calling the AI tutor for advice. ");
        }

        sb.append("\n\n### 📊 4. Cognitive Profile Persona\n");
        if (tutorAsks > 2 && compileFails > 2) {
            sb.append("**Interactive Troubleshooter**: Highly dependent on iterative checks and AI advice to locate logical boundary errors.");
        } else if (compileFails == 0) {
            sb.append("**Precise Planner**: Demonstrates a high level of code design accuracy and syntax familiarity before executing runs.");
        } else {
            sb.append("**Iterative Developer**: Relies on systematic trial-and-error runs to correct mistakes step-by-step.");
        }
        return sb.toString();
    }
}

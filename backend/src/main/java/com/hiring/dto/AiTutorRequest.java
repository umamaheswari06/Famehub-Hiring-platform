package com.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorRequest {
    private String type; // "CODING" or "MCQ"
    private String questionTitle;
    private String questionDescription;
    
    // Coding specific fields
    private String code;
    private String language;
    private String errorMessage;
    
    // MCQ specific fields
    private List<String> options;
    private String selectedOption;
    
    // Conversational fields
    private String userMessage;
    private List<ChatMessage> chatHistory;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String role; // "user" or "model"
        private String content; // text content
    }
}

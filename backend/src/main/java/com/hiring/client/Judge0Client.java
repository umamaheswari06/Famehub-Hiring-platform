package com.hiring.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class Judge0Client {

    @Value("${judge0.api-url}")
    private String judge0ApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Judge0Request {
        @JsonProperty("source_code")
        private String source_code;

        @JsonProperty("language_id")
        private int language_id;

        @JsonProperty("stdin")
        private String stdin;

        @JsonProperty("expected_output")
        private String expected_output;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Judge0TokenResponse {
        private String token;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Status {
        private int id;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Judge0ResultResponse {
        private String stdout;
        private String time;
        private Long memory;
        private String stderr;

        @JsonProperty("compile_output")
        private String compile_output;
        
        private Status status;
    }

    public String submitCode(String sourceCode, int languageId, String stdin, String expectedOutput) {
        try {
            String url = judge0ApiUrl + "/submissions?base64_encoded=false&wait=false";
            Judge0Request requestBody = Judge0Request.builder()
                    .source_code(sourceCode)
                    .language_id(languageId)
                    .stdin(stdin)
                    .expected_output(expectedOutput)
                    .build();

            ObjectMapper mapper = new ObjectMapper();
            log.info("Sending JSON payload to Judge0: {}", mapper.writeValueAsString(requestBody));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonPayload = mapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            Judge0TokenResponse response = restTemplate.postForObject(url, entity, Judge0TokenResponse.class);

            if (response != null) {
                return response.getToken();
            }
        } catch (Exception e) {
            log.error("Error submitting code to Judge0: {}", e.getMessage());
        }
        return null;
    }

    public Judge0ResultResponse getSubmissionResult(String token) {
        try {
            String url = judge0ApiUrl + "/submissions/" + token + "?base64_encoded=false";
            return restTemplate.getForObject(url, Judge0ResultResponse.class);
        } catch (Exception e) {
            log.error("Error retrieving result from Judge0 for token {}: {}", token, e.getMessage());
        }
        return null;
    }
}

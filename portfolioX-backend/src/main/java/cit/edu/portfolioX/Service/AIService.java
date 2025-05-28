package cit.edu.portfolioX.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

@Service
public class AIService {
    private static final Logger logger = LoggerFactory.getLogger(AIService.class);
    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String DEFAULT_MODEL = "mistralai/mistral-7b-instruct";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openrouter.api.key}")
    private String openRouterApiKey;

    public AIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void logApiKey() {
        logger.info("OpenRouter API Key loaded: {}", openRouterApiKey != null && !openRouterApiKey.isEmpty() ? "PRESENT" : "MISSING");
    }

    public String enhanceDescription(String title, String description, String category, String githubLink) {
        try {
            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("Rewrite the following portfolio description to be more professional, concise, and impactful. ")
                      .append("Use action verbs, highlight achievements, and avoid repetition. ")
                      .append("Format as a modern portfolio summary or bullet points. ")
                      .append("Here are the details:\n\n")
                      .append("Title: ").append(title).append("\n")
                      .append("Category: ").append(category).append("\n")
                      .append("Current Description: ").append(description).append("\n");
            if (githubLink != null && !githubLink.isEmpty()) {
                userPrompt.append("GitHub Link: ").append(githubLink).append("\n");
            }
            userPrompt.append("\nPlease rewrite the description to be more impactful, highlighting key aspects and achievements.");

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", DEFAULT_MODEL);
            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode systemMsg = objectMapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful assistant that enhances resume and portfolio content to be more professional and impactful.");
            messages.add(systemMsg);
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt.toString());
            messages.add(userMsg);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openRouterApiKey);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            logger.info("Sending request to OpenRouter for description enhancement");

            ResponseEntity<String> response = restTemplate.postForEntity(OPENROUTER_API_URL, request, String.class);
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String enhanced = responseJson.path("choices").path(0).path("message").path("content").asText();
            logger.info("AI enhanced description output: {}", enhanced);
            if (enhanced == null || enhanced.isEmpty()) {
                throw new RuntimeException("No content returned from OpenRouter");
            }
            return enhanced;
        } catch (Exception e) {
            logger.error("Error enhancing description: {}", e.getMessage());
            throw new RuntimeException("Failed to enhance description: " + e.getMessage());
        }
    }

    public String enhanceResume(String content) {
        try {
            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("Rewrite the following resume content to be more professional, concise, and impactful. ")
                      .append("Use action verbs, highlight achievements, and avoid repetition. ")
                      .append("Format as a modern resume summary or bullet points. ")
                      .append("Here is the content:\n\n")
                      .append(content);

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", DEFAULT_MODEL);
            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode systemMsg = objectMapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful assistant that enhances resume and portfolio content to be more professional and impactful.");
            messages.add(systemMsg);
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt.toString());
            messages.add(userMsg);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openRouterApiKey);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            logger.info("Sending request to OpenRouter for resume enhancement");

            ResponseEntity<String> response = restTemplate.postForEntity(OPENROUTER_API_URL, request, String.class);
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String enhanced = responseJson.path("choices").path(0).path("message").path("content").asText();
            logger.info("AI enhanced resume output: {}", enhanced);
            if (enhanced == null || enhanced.isEmpty()) {
                throw new RuntimeException("No content returned from OpenRouter");
            }
            return enhanced;
        } catch (Exception e) {
            logger.error("Error enhancing resume: {}", e.getMessage());
            throw new RuntimeException("Failed to enhance resume: " + e.getMessage());
        }
    }
} 
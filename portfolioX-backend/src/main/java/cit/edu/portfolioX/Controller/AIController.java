package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Service.AIService;
import cit.edu.portfolioX.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AIController {
    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    @Autowired
    private AIService aiService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/enhance-resume")
    public ResponseEntity<?> enhanceResume(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Received resume enhancement request");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid authorization header");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            if (username == null) {
                logger.error("Invalid token");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                logger.error("No content provided for enhancement");
                return ResponseEntity.badRequest().body(Map.of("error", "No content provided for enhancement"));
            }

            logger.debug("Processing content for user: {}", username);
            logger.debug("Content length: {}", content.length());

            String enhancedContent = aiService.enhanceResume(content);
            logger.info("Successfully enhanced resume content");
            
            return ResponseEntity.ok(Map.of("enhancedContent", enhancedContent));
        } catch (Exception e) {
            logger.error("Error enhancing resume: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error enhancing resume",
                "message", e.getMessage(),
                "details", e.getClass().getName()
            ));
        }
    }

    @PostMapping("/enhance-description")
    public ResponseEntity<?> enhanceDescription(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Received description enhancement request");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid authorization header");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            if (username == null) {
                logger.error("Invalid token");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            logger.debug("Processing request for user: {}", username);
            
            String enhancedDescription = aiService.enhanceDescription(
                request.get("title"),
                request.get("description"),
                request.get("category"),
                request.get("githubLink")
            );

            logger.info("Successfully enhanced description");
            return ResponseEntity.ok(Map.of("enhancedDescription", enhancedDescription));
        } catch (Exception e) {
            logger.error("Error enhancing description: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error enhancing description",
                "message", e.getMessage(),
                "details", e.getClass().getName()
            ));
        }
    }
} 
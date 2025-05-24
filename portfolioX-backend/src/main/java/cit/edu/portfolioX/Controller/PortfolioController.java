package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Service.PortfolioService;
import cit.edu.portfolioX.Service.UserService;
import cit.edu.portfolioX.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PortfolioController {
    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);

    @Autowired
    private PortfolioService service;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${server.url:http://localhost:8080}")
    private String serverUrl;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping
    public List<PortfolioEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<PortfolioEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestParam("portfolioTitle") String portfolioTitle,
            @RequestParam("portfolioDescription") String portfolioDescription,
            @RequestParam("category") String category,
            @RequestParam("userID") Long userID,
            @RequestParam(value = "githubLink", required = false) String githubLink,
            @RequestParam(value = "certTitle", required = false) String certTitle,
            @RequestParam(value = "issueDate", required = false) String issueDate,
            @RequestParam(value = "certFile", required = false) MultipartFile certFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Received portfolio creation request for userID: {}", userID);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid authorization header");
                return ResponseEntity.status(401).body("Invalid authorization header");
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            logger.info("Processing request for user: {}", username);

            UserEntity user = userService.findByUsername(username);
            if (user == null || !user.getUserID().equals(userID)) {
                logger.error("User not found or unauthorized: {}", username);
                return ResponseEntity.status(403).body("Unauthorized user");
            }

            if (portfolioTitle == null || portfolioTitle.trim().isEmpty()) {
                logger.error("Portfolio title is required");
                return ResponseEntity.badRequest().body("Portfolio title is required");
            }

            PortfolioEntity portfolio = new PortfolioEntity();
            portfolio.setPortfolioTitle(portfolioTitle);
            portfolio.setPortfolioDescription(portfolioDescription);
            portfolio.setCategory(category);
            portfolio.setUser(user);

            if ("project".equalsIgnoreCase(category)) {
                portfolio.setGithubLink(githubLink);
            } else if ("microcredentials".equalsIgnoreCase(category)) {
                if (certTitle == null || issueDate == null || certFile == null || certFile.isEmpty()) {
                    logger.error("Certificate title, issue date, and file are required for microcredentials");
                    return ResponseEntity.badRequest().body("Certificate title, issue date, and file are required");
                }
                portfolio.setCertTitle(certTitle);
                try {
                    LocalDate parsedDate = LocalDate.parse(issueDate);
                    portfolio.setIssueDate(parsedDate);
                } catch (DateTimeParseException e) {
                    logger.error("Invalid date format: {}", issueDate);
                    return ResponseEntity.badRequest().body("Invalid date format. Please use YYYY-MM-DD format");
                }
                String fileName = UUID.randomUUID() + "_" + certFile.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, certFile.getBytes());
                portfolio.setCertFile(filePath.toString());
            }

            PortfolioEntity savedPortfolio = service.save(portfolio);
            logger.info("Portfolio created successfully with ID: {}", savedPortfolio.getPortfolioID());

            return ResponseEntity.ok(Map.of(
                "portfolioID", savedPortfolio.getPortfolioID(),
                "portfolioTitle", savedPortfolio.getPortfolioTitle(),
                "portfolioDescription", savedPortfolio.getPortfolioDescription(),
                "category", savedPortfolio.getCategory(),
                "publicToken", savedPortfolio.getPublicToken(),
                "certTitle", savedPortfolio.getCertTitle() != null ? savedPortfolio.getCertTitle() : "",
                "issueDate", savedPortfolio.getIssueDate() != null ? savedPortfolio.getIssueDate().toString() : "",
                "githubLink", savedPortfolio.getGithubLink() != null ? savedPortfolio.getGithubLink() : ""
            ));
        } catch (Exception e) {
            logger.error("Error creating portfolio: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error creating portfolio: " + e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam("portfolioTitle") String portfolioTitle,
            @RequestParam("portfolioDescription") String portfolioDescription,
            @RequestParam("category") String category,
            @RequestParam("userID") Long userID,
            @RequestParam(value = "githubLink", required = false) String githubLink,
            @RequestParam(value = "certTitle", required = false) String certTitle,
            @RequestParam(value = "issueDate", required = false) String issueDate,
            @RequestParam(value = "certFile", required = false) MultipartFile certFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Received portfolio update request for ID: {} from userID: {}", id, userID);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid authorization header");
                return ResponseEntity.status(401).body("Invalid authorization header");
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            logger.info("Processing update request for user: {}", username);

            UserEntity user = userService.findByUsername(username);
            if (user == null || !user.getUserID().equals(userID)) {
                logger.error("User not found or unauthorized: {}", username);
                return ResponseEntity.status(403).body("Unauthorized user");
            }

            Optional<PortfolioEntity> existingPortfolio = service.getById(id);
            if (!existingPortfolio.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            PortfolioEntity portfolio = existingPortfolio.get();
            if (!portfolio.getUser().getUserID().equals(userID)) {
                return ResponseEntity.status(403).body("You can only update your own portfolios");
            }

            portfolio.setPortfolioTitle(portfolioTitle);
            portfolio.setPortfolioDescription(portfolioDescription);
            portfolio.setCategory(category);

            if ("project".equalsIgnoreCase(category)) {
                portfolio.setGithubLink(githubLink);
                portfolio.setCertTitle(null);
                portfolio.setIssueDate(null);
                portfolio.setCertFile(null);
            } else if ("microcredentials".equalsIgnoreCase(category)) {
                if (certTitle == null || issueDate == null) {
                    logger.error("Certificate title and issue date are required for microcredentials");
                    return ResponseEntity.badRequest().body("Certificate title and issue date are required");
                }
                portfolio.setGithubLink(null);
                portfolio.setCertTitle(certTitle);
                try {
                    LocalDate parsedDate = LocalDate.parse(issueDate);
                    portfolio.setIssueDate(parsedDate);
                } catch (DateTimeParseException e) {
                    logger.error("Invalid date format: {}", issueDate);
                    return ResponseEntity.badRequest().body("Invalid date format. Please use YYYY-MM-DD format");
                }

                if (certFile != null && !certFile.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + certFile.getOriginalFilename();
                    Path filePath = Paths.get(uploadDir, fileName);
                    Files.createDirectories(filePath.getParent());
                    Files.write(filePath, certFile.getBytes());
                    portfolio.setCertFile(filePath.toString());
                }
            }

            PortfolioEntity updatedPortfolio = service.save(portfolio);
            logger.info("Portfolio updated successfully with ID: {}", updatedPortfolio.getPortfolioID());

            return ResponseEntity.ok(Map.of(
                "portfolioID", updatedPortfolio.getPortfolioID(),
                "portfolioTitle", updatedPortfolio.getPortfolioTitle(),
                "portfolioDescription", updatedPortfolio.getPortfolioDescription(),
                "category", updatedPortfolio.getCategory(),
                "publicToken", updatedPortfolio.getPublicToken(),
                "certTitle", updatedPortfolio.getCertTitle() != null ? updatedPortfolio.getCertTitle() : "",
                "issueDate", updatedPortfolio.getIssueDate() != null ? updatedPortfolio.getIssueDate().toString() : "",
                "githubLink", updatedPortfolio.getGithubLink() != null ? updatedPortfolio.getGithubLink() : ""
            ));
        } catch (Exception e) {
            logger.error("Error updating portfolio: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error updating portfolio: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Received delete request for portfolio ID: {}", id);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid authorization header");
                return ResponseEntity.status(401).body("Invalid authorization header");
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userService.findByUsername(username);
            
            if (user == null) {
                logger.error("User not found: {}", username);
                return ResponseEntity.status(403).body("Unauthorized user");
            }

            Optional<PortfolioEntity> portfolio = service.getById(id);
            if (!portfolio.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            if (!portfolio.get().getUser().getUserID().equals(user.getUserID())) {
                return ResponseEntity.status(403).body("You can only delete your own portfolios");
            }

            service.delete(id);
            logger.info("Portfolio deleted successfully: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting portfolio: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error deleting portfolio: " + e.getMessage());
        }
    }

    @GetMapping("/student/{userId}")
    public List<PortfolioEntity> getPortfoliosByStudent(@PathVariable Long userId) {
        return service.findByUserId(userId);
    }

    @GetMapping("/public/{publicToken}")
    public PortfolioEntity getByPublicToken(@PathVariable String publicToken) {
        return service.findByPublicToken(publicToken)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
    }

    @GetMapping("/{id}/public-link")
    public String getPublicLink(@PathVariable Long id) {
        PortfolioEntity portfolio = service.getById(id)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        return serverUrl + "/api/portfolios/public/" + portfolio.getPublicToken();
    }
}
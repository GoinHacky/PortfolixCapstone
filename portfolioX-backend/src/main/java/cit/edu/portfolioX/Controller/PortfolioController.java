package cit.edu.portfolioX.Controller;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.ListItem;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import cit.edu.portfolioX.Entity.LinkEntity;
import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Entity.SkillEntity;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Entity.ProfileSettingEntity;
import cit.edu.portfolioX.Security.JwtUtil;
import cit.edu.portfolioX.Repository.SkillRepository;
import cit.edu.portfolioX.Service.CourseService;
import cit.edu.portfolioX.Service.NotificationService;
import cit.edu.portfolioX.Service.PortfolioService;
import cit.edu.portfolioX.Service.ProfileSettingService;
import cit.edu.portfolioX.Service.UserService;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://portfolixcapstone.netlify.app"})
public class PortfolioController {
    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);

    @Autowired
    private PortfolioService service;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CourseService courseService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProfileSettingService profileSettingService;

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
            @RequestParam(value = "skills", required = false) String skillsJson,
            @RequestParam(value = "courseCode", required = false) String courseCode,
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
            if (courseCode != null && !courseCode.isBlank()) {
                portfolio.setCourseCode(courseCode);
            }

            // Handle skills
            if (skillsJson != null && !skillsJson.isEmpty()) {
                for (String skillName : extractSkillNames(skillsJson)) {
                    SkillEntity skill = new SkillEntity();
                    skill.setSkillName(skillName);
                    skill.setPortfolio(portfolio);
                    portfolio.getSkills().add(skill);
                }
            }

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
                portfolio.setCertFile(Paths.get("uploads", fileName).toString().replace('\\', '/'));
            }

            LinkEntity link = new LinkEntity();
            link.setPortfolio(portfolio);
            link.setActive(true);
            portfolio.setLink(link);

            PortfolioEntity savedPortfolio = service.save(portfolio);
            logger.info("Portfolio created successfully with ID: {}", savedPortfolio.getPortfolioID());

            if ("project".equalsIgnoreCase(category)) {
                try {
                    Long projectId = savedPortfolio.getPortfolioID();
                    if (courseCode != null && !courseCode.isBlank()) {
                        courseService.findByCourseCode(courseCode)
                            .filter(course -> course.getCreatedBy() != null)
                            .flatMap(course -> userService.getById(course.getCreatedBy()))
                            .ifPresent(faculty -> notificationService.notifyProjectSubmission(faculty, user, projectId));
                    }
                } catch (Exception notifyEx) {
                    logger.warn("Failed to trigger project submission notification: {}", notifyEx.getMessage());
                }
            }

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

    @Transactional
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
            @RequestParam(value = "skills", required = false) String skillsJson,
            @RequestParam(value = "courseCode", required = false) String courseCode,
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
            if (courseCode != null && !courseCode.isBlank()) {
                portfolio.setCourseCode(courseCode);
            } else {
                portfolio.setCourseCode(null);
            }

            // Handle skills
            if (skillsJson != null) {
                List<String> skillNames = skillsJson.isEmpty() ? java.util.Collections.emptyList() : extractSkillNames(skillsJson);
                List<SkillEntity> skillEntities = new java.util.ArrayList<>();
                for (String skillName : skillNames) {
                    SkillEntity skill = new SkillEntity();
                    skill.setSkillName(skillName);
                    skill.setPortfolio(portfolio);
                    skillEntities.add(skill);
                }
                if (portfolio.getSkills() == null) {
                    portfolio.setSkills(new java.util.ArrayList<>());
                }
                skillRepository.deleteByPortfolio(portfolio);
                portfolio.getSkills().clear();
                portfolio.getSkills().addAll(skillEntities);
            }

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
                    portfolio.setCertFile(Paths.get("uploads", fileName).toString().replace('\\', '/'));
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
    public ResponseEntity<?> getByPublicToken(@PathVariable String publicToken) {
        Optional<PortfolioEntity> portfolioOpt = service.findByPublicToken(publicToken);
        if (portfolioOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Portfolio not found");
        }
        PortfolioEntity portfolio = portfolioOpt.get();
        if (portfolio.getLink() == null || !portfolio.getLink().isActive()) {
            return ResponseEntity.status(403).body("This portfolio is private");
        }
        return ResponseEntity.ok(portfolio);
    }

    @GetMapping("/{id}/public-link")
    public String getPublicLink(@PathVariable Long id) {
        PortfolioEntity portfolio = service.getById(id)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        // If no link, create one
        if (portfolio.getLink() == null) {
            LinkEntity link = new LinkEntity();
            link.setPortfolio(portfolio);
            link.setActive(true); // or false if you want default private
            portfolio.setLink(link);
            service.save(portfolio);
        }
        return "http://localhost:8080/public/view/" + portfolio.getPublicToken();
    }

    @PostMapping("/generate-resume/{userId}")
    public ResponseEntity<?> generateResume(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) boolean enhanced,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        try {
            logger.info("Attempting to generate resume for user ID: {}, enhanced: {}", userId, enhanced);
            logger.info("Request body: {}", requestBody);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid authorization header");
                return ResponseEntity.status(401).body("Invalid authorization header");
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            logger.info("Token validated for user: {}", username);

            UserEntity user = userService.findByUsername(username);
            if (user == null) {
                logger.error("User not found: {}", username);
                return ResponseEntity.status(404).body("User not found");
            }

            if (!user.getUserID().equals(userId)) {
                logger.error("Unauthorized access attempt. Token user: {}, Requested user ID: {}", username, userId);
                return ResponseEntity.status(403).body("Unauthorized access");
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            pdf.setDefaultPageSize(PageSize.A4);
            Document document = new Document(pdf);
            document.setMargins(40, 36, 40, 36);

            DeviceRgb maroonColor = new DeviceRgb(128, 0, 0);       // Maroon #800000
            DeviceRgb goldColor = new DeviceRgb(212, 175, 55);      // Gold #D4AF37
            DeviceRgb darkGrayColor = new DeviceRgb(52, 52, 52);    // Dark Gray #343434
            DeviceRgb lightGrayColor = new DeviceRgb(127, 127, 127); // Light Gray

            List<PortfolioEntity> portfolios = service.findByUserId(userId);
            List<PortfolioEntity> projectPortfolios = portfolios.stream()
                .filter(p -> "project".equalsIgnoreCase(p.getCategory()))
                .sorted((a, b) -> {
                    if (a.getLastUpdated() == null || b.getLastUpdated() == null) {
                        return 0;
                    }
                    return b.getLastUpdated().compareTo(a.getLastUpdated());
                })
                .collect(Collectors.toList());

            List<PortfolioEntity> credentialPortfolios = portfolios.stream()
                .filter(p -> "microcredentials".equalsIgnoreCase(p.getCategory()))
                .sorted((a, b) -> {
                    if (a.getIssueDate() == null || b.getIssueDate() == null) {
                        return 0;
                    }
                    return b.getIssueDate().compareTo(a.getIssueDate());
                })
                .collect(Collectors.toList());

            Set<String> uniqueSkills = new LinkedHashSet<>();
            portfolios.stream()
                .filter(p -> p.getSkills() != null)
                .forEach(p -> p.getSkills().forEach(skill -> {
                    if (skill.getSkillName() != null && !skill.getSkillName().isBlank()) {
                        uniqueSkills.add(skill.getSkillName().trim());
                    }
                }));

            Map<String, String> userSettings = buildSettingsMap(userId);

            String enhancedContentText = null;
            if (requestBody != null && requestBody.containsKey("enhancedContent")) {
                Object raw = requestBody.get("enhancedContent");
                if (raw instanceof String) {
                    enhancedContentText = ((String) raw).trim();
                }
            }
            logger.info("Enhanced flag: {}, enhanced content length: {}", enhanced, enhancedContentText == null ? 0 : enhancedContentText.length());

            addResumeHeader(document, user, portfolios, uniqueSkills, userSettings, maroonColor, goldColor, darkGrayColor, lightGrayColor);

            String summaryText = null;
            if (enhanced && enhancedContentText != null && !enhancedContentText.isEmpty()) {
                summaryText = sanitizeSummaryText(enhancedContentText);
            } else if (user.getBio() != null && !user.getBio().isBlank()) {
                summaryText = sanitizeSummaryText(user.getBio());
            }

            if (summaryText != null && !summaryText.isBlank()) {
                addSummarySection(document, summaryText, maroonColor, darkGrayColor, goldColor);
            }

            if (!projectPortfolios.isEmpty()) {
                addProjectsSection(document, projectPortfolios, maroonColor, goldColor, darkGrayColor, lightGrayColor);
            }

            if (!credentialPortfolios.isEmpty()) {
                addEducationSection(document, credentialPortfolios, maroonColor, goldColor, darkGrayColor, lightGrayColor);
            }

            if (!uniqueSkills.isEmpty()) {
                addSkillsSection(document, uniqueSkills, maroonColor, goldColor, darkGrayColor);
            }

            addReferencesSection(document, maroonColor, goldColor, lightGrayColor);

            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                user.getFname().toLowerCase() + "_" + user.getLname().toLowerCase() + "_portfolio.pdf");

            logger.info("Successfully generated resume PDF for user ID: {}", userId);
            return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());

        } catch (Exception e) {
            logger.error("Error generating resume: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error generating resume: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/public-status")
    public ResponseEntity<?> updatePublicStatus(
            @PathVariable Long id,
            @RequestParam boolean isPublic,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userService.findByUsername(username);

            Optional<PortfolioEntity> portfolioOpt = service.getById(id);
            if (portfolioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            PortfolioEntity portfolio = portfolioOpt.get();

            // Only the owner can toggle public/private
            if (!portfolio.getUser().getUserID().equals(user.getUserID())) {
                return ResponseEntity.status(403).body("You can only update your own portfolios");
            }

            if (portfolio.getLink() == null) {
                return ResponseEntity.badRequest().body("No link entity found for this portfolio");
            }

            portfolio.getLink().setActive(isPublic);
            service.save(portfolio); // Save the owning side

            return ResponseEntity.ok(Map.of(
                "portfolioID", portfolio.getPortfolioID(),
                "isActive", portfolio.getLink().isActive()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating public status: " + e.getMessage());
        }
    }

    @GetMapping("/backfill-links")
    public ResponseEntity<?> backfillLinks() {
        List<PortfolioEntity> all = service.getAll();
        int count = 0;
        for (PortfolioEntity p : all) {
            if (p.getLink() == null) {
                LinkEntity link = new LinkEntity();
                link.setPortfolio(p);
                link.setActive(false); // Default to private
                p.setLink(link);
                service.save(p);
                count++;
            }
        }
        return ResponseEntity.ok("Backfilled " + count + " portfolios with missing links.");
    }

    @PatchMapping("/{id}/validate")
    public ResponseEntity<?> validateProject(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity faculty = userService.findByUsername(username);
            if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
                return ResponseEntity.status(403).body("Only faculty can validate projects");
            }
            Optional<PortfolioEntity> portfolioOpt = service.getById(id);
            if (portfolioOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Portfolio not found");
            }
            PortfolioEntity portfolio = portfolioOpt.get();
            if (!"project".equalsIgnoreCase(portfolio.getCategory())) {
                return ResponseEntity.badRequest().body("Only projects can be validated");
            }
            if (portfolio.isValidatedByFaculty()) {
                return ResponseEntity.badRequest().body("Project already validated");
            }
            // If project has a courseCode, only the faculty who created that course can validate
            if (portfolio.getCourseCode() != null && !portfolio.getCourseCode().isBlank()) {
                var courseOpt = courseService.findByCourseCode(portfolio.getCourseCode());
                if (courseOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Course code not found");
                }
                if (!courseOpt.get().getCreatedBy().equals(faculty.getUserID())) {
                    return ResponseEntity.status(403).body("Only the faculty who created this course can validate this project");
                }
            }
            portfolio.setValidatedByFaculty(true);
            portfolio.setValidatedByName(faculty.getFname() + " " + faculty.getLname());
            portfolio.setValidatedById(faculty.getUserID());
            service.save(portfolio);

            try {
                if (portfolio.getUser() != null) {
                    notificationService.notifyProjectValidated(portfolio.getUser(), faculty, portfolio.getPortfolioID());
                }
            } catch (Exception notifyEx) {
                logger.warn("Failed to notify student about project validation: {}", notifyEx.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "portfolioID", portfolio.getPortfolioID(),
                "validatedByFaculty", true,
                "validatedByName", portfolio.getValidatedByName(),
                "validatedById", portfolio.getValidatedById()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error validating project: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/unvalidate")
    public ResponseEntity<?> unvalidateProject(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity faculty = userService.findByUsername(username);
            if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
                return ResponseEntity.status(403).body("Only faculty can unvalidate projects");
            }
            Optional<PortfolioEntity> portfolioOpt = service.getById(id);
            if (portfolioOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Portfolio not found");
            }
            PortfolioEntity portfolio = portfolioOpt.get();
            if (!"project".equalsIgnoreCase(portfolio.getCategory())) {
                return ResponseEntity.badRequest().body("Only projects can be unvalidated");
            }
            if (!portfolio.isValidatedByFaculty()) {
                return ResponseEntity.badRequest().body("Project is not validated");
            }
            // If project has a courseCode, only the faculty who created that course can unvalidate
            if (portfolio.getCourseCode() != null && !portfolio.getCourseCode().isBlank()) {
                var courseOpt = courseService.findByCourseCode(portfolio.getCourseCode());
                if (courseOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Course code not found");
                }
                if (!courseOpt.get().getCreatedBy().equals(faculty.getUserID())) {
                    return ResponseEntity.status(403).body("Only the faculty who created this course can unvalidate this project");
                }
            }
            portfolio.setValidatedByFaculty(false);
            portfolio.setValidatedByName(null);
            portfolio.setValidatedById(null);
            service.save(portfolio);

            try {
                if (portfolio.getUser() != null) {
                    notificationService.notifyProjectUnvalidated(portfolio.getUser(), faculty, portfolio.getPortfolioID());
                }
            } catch (Exception notifyEx) {
                logger.warn("Failed to notify student about project unvalidation: {}", notifyEx.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "portfolioID", portfolio.getPortfolioID(),
                "validatedByFaculty", false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error unvalidating project: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/witness")
    public ResponseEntity<?> witnessMicrocredential(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity faculty = userService.findByUsername(username);
            if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
                return ResponseEntity.status(403).body("Only faculty can witness microcredentials");
            }
            Optional<PortfolioEntity> portfolioOpt = service.getById(id);
            if (portfolioOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Portfolio not found");
            }
            PortfolioEntity portfolio = portfolioOpt.get();
            if (!"microcredentials".equalsIgnoreCase(portfolio.getCategory())) {
                return ResponseEntity.badRequest().body("Only microcredentials can be witnessed");
            }
            
            String witnessIds = portfolio.getWitnessedByIds() != null ? portfolio.getWitnessedByIds() : "";
            String witnessNames = portfolio.getWitnessedByNames() != null ? portfolio.getWitnessedByNames() : "";
            
            // Check if already witnessed by this faculty
            if (witnessIds.contains(faculty.getUserID().toString())) {
                return ResponseEntity.badRequest().body("You have already witnessed this microcredential");
            }
            
            // Add witness
            if (!witnessIds.isEmpty()) {
                witnessIds += "," + faculty.getUserID();
                witnessNames += "," + faculty.getFname() + " " + faculty.getLname();
            } else {
                witnessIds = faculty.getUserID().toString();
                witnessNames = faculty.getFname() + " " + faculty.getLname();
            }
            
            portfolio.setWitnessedByIds(witnessIds);
            portfolio.setWitnessedByNames(witnessNames);
            service.save(portfolio);

            try {
                if (portfolio.getUser() != null) {
                    notificationService.notifyMicrocredentialWitnessed(portfolio.getUser(), faculty, portfolio.getPortfolioID());
                }
            } catch (Exception notifyEx) {
                logger.warn("Failed to notify student about microcredential witness: {}", notifyEx.getMessage());
            }
            
            return ResponseEntity.ok(Map.of(
                "portfolioID", portfolio.getPortfolioID(),
                "witnessedByIds", portfolio.getWitnessedByIds(),
                "witnessedByNames", portfolio.getWitnessedByNames()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error witnessing microcredential: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/unwitness")
    public ResponseEntity<?> unwitnessMicrocredential(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity faculty = userService.findByUsername(username);
            if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
                return ResponseEntity.status(403).body("Only faculty can unwitness microcredentials");
            }
            Optional<PortfolioEntity> portfolioOpt = service.getById(id);
            if (portfolioOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Portfolio not found");
            }
            PortfolioEntity portfolio = portfolioOpt.get();
            
            String witnessIds = portfolio.getWitnessedByIds() != null ? portfolio.getWitnessedByIds() : "";
            String witnessNames = portfolio.getWitnessedByNames() != null ? portfolio.getWitnessedByNames() : "";
            
            if (witnessIds.isEmpty()) {
                return ResponseEntity.badRequest().body("No witnesses found");
            }
            
            // Remove this faculty's witness
            String[] idArray = witnessIds.split(",");
            String[] nameArray = witnessNames.split(",");
            List<String> newIds = new java.util.ArrayList<>();
            List<String> newNames = new java.util.ArrayList<>();
            
            for (int i = 0; i < idArray.length; i++) {
                if (!idArray[i].equals(faculty.getUserID().toString())) {
                    newIds.add(idArray[i]);
                    if (i < nameArray.length) {
                        newNames.add(nameArray[i]);
                    }
                }
            }
            
            portfolio.setWitnessedByIds(String.join(",", newIds));
            portfolio.setWitnessedByNames(String.join(",", newNames));
            service.save(portfolio);

            try {
                if (portfolio.getUser() != null) {
                    notificationService.notifyMicrocredentialUnwitnessed(portfolio.getUser(), faculty, portfolio.getPortfolioID());
                }
            } catch (Exception notifyEx) {
                logger.warn("Failed to notify student about microcredential unwitness: {}", notifyEx.getMessage());
            }
            
            return ResponseEntity.ok(Map.of(
                "portfolioID", portfolio.getPortfolioID(),
                "witnessedByIds", portfolio.getWitnessedByIds(),
                "witnessedByNames", portfolio.getWitnessedByNames()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error unwitnessing microcredential: " + e.getMessage());
        }
    }

    private List<String> extractSkillNames(String skillsJson) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(skillsJson);
        List<String> skillNames = new ArrayList<>();

        if (node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual()) {
                    skillNames.add(item.asText());
                } else if (item.hasNonNull("skillName")) {
                    skillNames.add(item.get("skillName").asText());
                }
            }
        } else if (node.isTextual()) {
            skillNames.add(node.asText());
        }

        return skillNames;
    }

    private Map<String, String> buildSettingsMap(Long userId) {
        Map<String, String> settings = new HashMap<>();
        try {
            List<ProfileSettingEntity> profileSettings = profileSettingService.findByUserId(userId);
            if (profileSettings != null) {
                for (ProfileSettingEntity setting : profileSettings) {
                    if (setting.getSettingKey() != null && setting.getSettingValue() != null) {
                        settings.put(setting.getSettingKey(), setting.getSettingValue());
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to load profile settings for resume: {}", e.getMessage());
        }
        return settings;
    }

    private void addResumeHeader(Document document, UserEntity user, List<PortfolioEntity> portfolios, Set<String> skills,
                                 Map<String, String> settings, DeviceRgb maroon, DeviceRgb gold, DeviceRgb darkGray, DeviceRgb lightGray) {
        String fullName = (user.getFname() + " " + user.getLname()).trim();
        if (fullName.isBlank()) {
            fullName = user.getUsername();
        }

        String title = settings.getOrDefault("headline", "Full Stack Developer & UI/UX Designer");

        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{65, 35}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);

        // Left column: Name, title, bio
        Cell left = new Cell().setBorder(Border.NO_BORDER).setPaddingRight(20);
        left.add(new Paragraph(fullName.toUpperCase())
            .setFontSize(26)
            .setFontColor(darkGray)
            .setBold()
            .setMarginBottom(4));
        left.add(new Paragraph(title)
            .setFontSize(12)
            .setFontColor(lightGray)
            .setMarginBottom(12));

        if (user.getBio() != null && !user.getBio().isBlank()) {
            left.add(new Paragraph(user.getBio().trim())
                .setFontSize(11)
                .setFontColor(darkGray)
                .setMarginBottom(12));
        }

        // Stats chips (projects, credentials)
        int projectCount = (int) portfolios.stream().filter(p -> "project".equalsIgnoreCase(p.getCategory())).count();
        int credentialCount = (int) portfolios.stream().filter(p -> "microcredentials".equalsIgnoreCase(p.getCategory())).count();

        Table statsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
            .setWidth(UnitValue.createPercentValue(100));
        statsTable.addCell(createStatChip(projectCount + " Projects", maroon, gold));
        statsTable.addCell(createStatChip(credentialCount + " Credentials", maroon, gold));
        left.add(statsTable.setMarginBottom(12));

        if (!skills.isEmpty()) {
            Paragraph skillList = new Paragraph("Top skills: " + skills.stream().limit(5).collect(Collectors.joining(", ")))
                .setFontSize(10)
                .setFontColor(lightGray)
                .setMarginBottom(0);
            left.add(skillList);
        }

        headerTable.addCell(left);

        // Right column: contact and meta
        Cell right = new Cell().setBorder(Border.NO_BORDER).setBackgroundColor(new DeviceRgb(248, 248, 248)).setPadding(12);
        right.add(createContactRow("Phone", settings.getOrDefault("phone", "+63 900 000 0000"), gold, darkGray));
        right.add(createContactRow("Email", user.getUserEmail(), gold, darkGray));
        right.add(createContactRow("Location", settings.getOrDefault("address", "Cebu City, PH"), gold, darkGray));
        if (settings.containsKey("website")) {
            right.add(createContactRow("Portfolio", settings.get("website"), gold, darkGray));
        }

        headerTable.addCell(right);
        document.add(headerTable);
    }

    private Cell createStatChip(String text, DeviceRgb maroon, DeviceRgb gold) {
        return new Cell()
            .add(new Paragraph(text)
                .setFontSize(10)
                .setFontColor(maroon)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER))
            .setBackgroundColor(new DeviceRgb(252, 245, 235))
            .setBorder(new SolidBorder(gold, 1))
            .setPadding(8)
            .setMargin(4);
    }

    private Paragraph createContactRow(String label, String value, DeviceRgb gold, DeviceRgb darkGray) {
        return new Paragraph()
            .add(new Text(label + ": ").setFontColor(gold).setBold())
            .add(new Text(value != null ? value : "-").setFontColor(darkGray).setFontSize(10))
            .setMarginBottom(6);
    }

    private String sanitizeSummaryText(String input) {
        if (input == null) {
            return null;
        }

        String text = input
            .replaceAll("(?s)```.*?```", " ")
            .replaceAll("(?m)^>{1,3}\\s*", "")
            .replaceAll("(?m)^#{1,6}\\s*", "")
            .replaceAll("(?m)^[-*+]\\s*", "")
            .replaceAll("---+", " ")
            .replaceAll("\\*\\*", "")
            .replaceAll("__", "")
            .replaceAll("`", "")
            .replaceAll("(?i)here'?s a refined[^\\n]*", "")
            .replaceAll("(?i)improved version[^\\n]*", "")
            .replaceAll("(?i)professional summary:?", "");

        text = text.replaceAll("\\s+", " ").trim();

        if (text.length() > 450) {
            int cutoff = text.lastIndexOf('.', 450);
            if (cutoff < 150) {
                cutoff = 450;
            }
            text = text.substring(0, Math.min(cutoff + 1, text.length())).trim();
            if (!text.endsWith(".")) {
                text = text + "...";
            }
        }

        return text;
    }

    private void addSummarySection(Document document, String summary, DeviceRgb maroon, DeviceRgb darkGray, DeviceRgb gold) {
        addSectionHeader(document, "PROFESSIONAL SUMMARY", maroon, gold);
        document.add(new Paragraph(summary)
            .setFontSize(11)
            .setFontColor(darkGray)
            .setMarginBottom(12));
    }

    private void addProjectsSection(Document document, List<PortfolioEntity> projects, DeviceRgb maroon, DeviceRgb gold,
                                    DeviceRgb darkGray, DeviceRgb lightGray) {
        addSectionHeader(document, "PROJECT EXPERIENCE", maroon, gold);

        for (PortfolioEntity project : projects) {
            Div wrapper = new Div().setMarginBottom(12);
            String titleLine = project.getPortfolioTitle();
            if (project.getCourseCode() != null && !project.getCourseCode().isBlank()) {
                titleLine += " • " + project.getCourseCode();
            }
            wrapper.add(new Paragraph(titleLine)
                .setFontSize(12)
                .setFontColor(darkGray)
                .setBold());
            wrapper.add(new Paragraph("Cebu City, PH")
                .setFontSize(10)
                .setFontColor(lightGray)
                .setMarginBottom(4));

            com.itextpdf.layout.element.List bulletList = new com.itextpdf.layout.element.List()
                .setSymbolIndent(12)
                .setListSymbol("• ")
                .setFontSize(10)
                .setFontColor(darkGray);
            bulletList.add(new ListItem(project.getPortfolioDescription() != null ? project.getPortfolioDescription() : ""));
            if (project.getGithubLink() != null && !project.getGithubLink().isBlank()) {
                bulletList.add(new ListItem("Repository: " + project.getGithubLink()));
            }
            wrapper.add(bulletList);

            document.add(wrapper);
        }
    }

    private void addEducationSection(Document document, List<PortfolioEntity> credentials, DeviceRgb maroon, DeviceRgb gold,
                                     DeviceRgb darkGray, DeviceRgb lightGray) {
        addSectionHeader(document, "EDUCATION & CERTIFICATIONS", maroon, gold);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");

        for (PortfolioEntity credential : credentials) {
            Div wrapper = new Div().setMarginBottom(10);
            wrapper.add(new Paragraph(credential.getCertTitle() != null ? credential.getCertTitle() : "Certification")
                .setFontSize(12)
                .setFontColor(darkGray)
                .setBold());

            String meta = "Cebu City, PH";
            if (credential.getIssueDate() != null) {
                meta += " • Issued " + credential.getIssueDate().format(formatter);
            }
            wrapper.add(new Paragraph(meta)
                .setFontSize(10)
                .setFontColor(lightGray)
                .setMarginBottom(4));

            if (credential.getPortfolioDescription() != null) {
                wrapper.add(new Paragraph(credential.getPortfolioDescription())
                    .setFontSize(10)
                    .setFontColor(darkGray));
            }

            document.add(wrapper);
        }
    }

    private void addSkillsSection(Document document, Set<String> skills, DeviceRgb maroon, DeviceRgb gold, DeviceRgb darkGray) {
        addSectionHeader(document, "TECHNICAL SKILLS", maroon, gold);
        Paragraph skillParagraph = new Paragraph(String.join(" • ", skills))
            .setFontSize(10)
            .setFontColor(darkGray);
        document.add(skillParagraph.setMarginBottom(12));
    }

    private void addReferencesSection(Document document, DeviceRgb maroon, DeviceRgb gold, DeviceRgb lightGray) {
        addSectionHeader(document, "REFERENCES", maroon, gold);
        document.add(new Paragraph("Available upon request")
            .setFontSize(10)
            .setFontColor(lightGray));
    }

    private void addSectionHeader(Document document, String title, DeviceRgb maroon, DeviceRgb gold) {
        Table header = new Table(UnitValue.createPercentArray(new float[]{1}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(8)
            .setMarginTop(12);

        Cell cell = new Cell()
            .setBorder(Border.NO_BORDER)
            .setBackgroundColor(maroon)
            .setPadding(8);
        cell.add(new Paragraph(title)
            .setFontSize(11)
            .setFontColor(new DeviceRgb(255, 255, 255))
            .setBold());
        header.addCell(cell);

        Table accent = new Table(UnitValue.createPercentArray(new float[]{1}))
            .setWidth(UnitValue.createPercentValue(100));
        accent.addCell(new Cell()
            .setBorder(Border.NO_BORDER)
            .setBorderBottom(new SolidBorder(gold, 2))
            .setPadding(0)
            .setMarginBottom(8));

        document.add(header);
        document.add(accent);
    }
}

/*
@Controller
@RequestMapping("/public/view")
class PublicPortfolioViewController {
    @Autowired
    private PortfolioService service;

    @GetMapping("/{publicToken}")
    public ModelAndView viewPublicPortfolio(@PathVariable String publicToken) {
        PortfolioEntity portfolio = service.findByPublicToken(publicToken)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        ModelAndView mav = new ModelAndView("public-portfolio");
        mav.addObject("portfolio", portfolio);
        return mav;
    }
}
*/
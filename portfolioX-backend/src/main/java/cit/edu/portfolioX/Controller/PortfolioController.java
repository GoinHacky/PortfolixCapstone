package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Entity.LinkEntity;
import cit.edu.portfolioX.Entity.SkillEntity;
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
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.BorderRadius;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.servlet.ModelAndView;
import com.fasterxml.jackson.databind.ObjectMapper;
import cit.edu.portfolioX.Service.CourseService;

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

    @Autowired
    private CourseService courseService;

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
                ObjectMapper mapper = new ObjectMapper();
                String[] skillsArr = mapper.readValue(skillsJson, String[].class);
                for (String skillName : skillsArr) {
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
                portfolio.setCertFile(filePath.toString());
            }

            LinkEntity link = new LinkEntity();
            link.setPortfolio(portfolio);
            link.setActive(true);
            portfolio.setLink(link);

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
                ObjectMapper mapper = new ObjectMapper();
                String[] skillsArr = skillsJson.isEmpty() ? new String[0] : mapper.readValue(skillsJson, String[].class);
                List<SkillEntity> skillEntities = new java.util.ArrayList<>();
                for (String skillName : skillsArr) {
                    SkillEntity skill = new SkillEntity();
                    skill.setSkillName(skillName);
                    skill.setPortfolio(portfolio);
                    skillEntities.add(skill);
                }
                if (portfolio.getSkills() == null) {
                    portfolio.setSkills(new java.util.ArrayList<>());
                }
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
            @RequestBody(required = false) Map<String, String> enhancedContent) {
        try {
            logger.info("Attempting to generate resume for user ID: {}", userId);
            
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
            document.setMargins(36, 36, 36, 36); // 0.5 inch margins

            // Color scheme
            DeviceRgb maroonColor = new DeviceRgb(128, 0, 0);
            DeviceRgb goldColor = new DeviceRgb(212, 175, 55);
            DeviceRgb grayColor = new DeviceRgb(128, 128, 128);

            // Header Section
            Div header = new Div()
                .setBackgroundColor(maroonColor)
                .setPadding(20)
                .setMarginBottom(20);

            header.add(new Paragraph(user.getFname() + " " + user.getLname())
                .setFontSize(28)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(goldColor)
                .setBold());

            header.add(new Paragraph(user.getUserEmail())
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(255, 255, 255)));

            document.add(header);

            if (enhanced && enhancedContent != null && enhancedContent.containsKey("enhancedContent")) {
                // Add a single section with the enhanced content
                Paragraph enhancedHeader = new Paragraph("AI-Enhanced Resume Content")
                    .setFontSize(20)
                    .setFontColor(maroonColor)
                    .setBold()
                    .setMarginBottom(10);
                document.add(enhancedHeader);

                Div separator = new Div()
                    .setHeight(1)
                    .setBackgroundColor(new DeviceRgb(200, 200, 200))
                    .setMarginBottom(10);
                document.add(separator);

                document.add(new Paragraph(enhancedContent.get("enhancedContent"))
                    .setFontSize(12)
                    .setFontColor(grayColor)
                    .setMarginBottom(20));
            } else {
                // Standard resume generation logic
                List<PortfolioEntity> portfolios = service.findByUserId(userId);

                // Projects Section
                Paragraph projectsHeader = new Paragraph("Professional Projects")
                    .setFontSize(20)
                    .setFontColor(maroonColor)
                    .setBold()
                    .setMarginBottom(10);
                document.add(projectsHeader);

                Div separator = new Div()
                    .setHeight(1)
                    .setBackgroundColor(new DeviceRgb(200, 200, 200))
                    .setMarginBottom(10);
                document.add(separator);

                portfolios.stream()
                    .filter(p -> "project".equalsIgnoreCase(p.getCategory()))
                    .forEach(project -> {
                        // Project Title with Gold Bullet
                        Div projectDiv = new Div()
                            .setMarginBottom(15);

                        projectDiv.add(new Paragraph("• " + project.getPortfolioTitle())
                            .setFontSize(16)
                            .setFontColor(goldColor)
                            .setBold());

                        // Project Description
                        projectDiv.add(new Paragraph(project.getPortfolioDescription())
                            .setFontSize(12)
                            .setMarginLeft(15)
                            .setMarginTop(5));

                        // GitHub Link
                        if (project.getGithubLink() != null) {
                            projectDiv.add(new Paragraph("GitHub Repository: " + project.getGithubLink())
                                .setFontSize(10)
                                .setFontColor(new DeviceRgb(51, 102, 187))
                                .setMarginLeft(15)
                                .setMarginTop(5));
                        }

                        document.add(projectDiv);
                    });

                // Microcredentials Section
                document.add(new Paragraph("\n"));
                Paragraph credentialsHeader = new Paragraph("Certifications & Microcredentials")
                    .setFontSize(20)
                    .setFontColor(maroonColor)
                    .setBold()
                    .setMarginBottom(10);
                document.add(credentialsHeader);

                Div separator2 = new Div()
                    .setHeight(1)
                    .setBackgroundColor(new DeviceRgb(200, 200, 200))
                    .setMarginBottom(10);
                document.add(separator2);

                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");

                portfolios.stream()
                    .filter(p -> "microcredentials".equalsIgnoreCase(p.getCategory()))
                    .forEach(cert -> {
                        Div certDiv = new Div()
                            .setMarginBottom(15);

                        // Certificate Title
                        certDiv.add(new Paragraph("• " + cert.getCertTitle())
                            .setFontSize(16)
                            .setFontColor(goldColor)
                            .setBold());

                        // Certificate Description
                        certDiv.add(new Paragraph(cert.getPortfolioDescription())
                            .setFontSize(12)
                            .setMarginLeft(15)
                            .setMarginTop(5));

                        // Issue Date
                        if (cert.getIssueDate() != null) {
                            certDiv.add(new Paragraph("Issued: " + cert.getIssueDate().format(dateFormatter))
                                .setFontSize(10)
                                .setFontColor(grayColor)
                                .setMarginLeft(15)
                                .setMarginTop(5));
                        }

                        document.add(certDiv);
                    });
            }

            // Footer
            document.add(new Paragraph("\n"));
            Div footerSeparator = new Div()
                .setHeight(1)
                .setBackgroundColor(new DeviceRgb(200, 200, 200));
            document.add(footerSeparator);
            document.add(new Paragraph("Generated via PortfolioX")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(8)
                .setFontColor(grayColor)
                .setMarginTop(10));

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
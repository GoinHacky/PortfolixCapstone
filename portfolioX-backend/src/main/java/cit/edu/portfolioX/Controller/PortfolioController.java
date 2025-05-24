package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Service.PortfolioService;
import cit.edu.portfolioX.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

    @Autowired
    private PortfolioService service;

    @Autowired
    private UserService userService;

    @Value("${server.url:http://localhost:8080}")
    private String serverUrl;

    @GetMapping
    public List<PortfolioEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<PortfolioEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public PortfolioEntity create(@RequestBody PortfolioEntity portfolio) {
        // Ensure user is set and managed
        if (portfolio.getUser() != null && portfolio.getUser().getUserID() != null) {
            Optional<UserEntity> userOpt = userService.getById(portfolio.getUser().getUserID());
            if (userOpt.isPresent()) {
                portfolio.setUser(userOpt.get());
            } else {
                throw new RuntimeException("User not found.");
            }
        } else {
            throw new RuntimeException("User information is required.");
        }

        // For "project", githubLink must be present; for "microcredentials", certTitle, issueDate, certFile must be present
        if ("project".equalsIgnoreCase(portfolio.getCategory())) {
            if (portfolio.getGithubLink() == null || portfolio.getGithubLink().isEmpty()) {
                throw new RuntimeException("githubLink is required for project category.");
            }
        } else if ("microcredentials".equalsIgnoreCase(portfolio.getCategory())) {
            if (portfolio.getCertTitle() == null || portfolio.getIssueDate() == null || portfolio.getCertFile() == null) {
                throw new RuntimeException("certTitle, issueDate, and certFile are required for microcredentials category.");
            }
        } else {
            throw new RuntimeException("Invalid category. Must be 'project' or 'microcredentials'.");
        }

        return service.save(portfolio);
    }

    @PutMapping("/{id}")
    public PortfolioEntity update(@PathVariable Long id, @RequestBody PortfolioEntity portfolio) {
        portfolio.setPortfolioID(id);
        // Fetch managed UserEntity
        if (portfolio.getUser() != null && portfolio.getUser().getUserID() != null) {
            Optional<UserEntity> userOpt = userService.getById(portfolio.getUser().getUserID());
            userOpt.ifPresent(portfolio::setUser);
        }
        return service.save(portfolio);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Get all portfolios for a student (by userID)
    @GetMapping("/student/{userId}")
    public List<PortfolioEntity> getPortfoliosByStudent(@PathVariable Long userId) {
        return service.findByUserId(userId);
    }

    // Get a portfolio by its public token
    @GetMapping("/public/{publicToken}")
    public PortfolioEntity getByPublicToken(@PathVariable String publicToken) {
        return service.findByPublicToken(publicToken)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
    }

    // Get the public link for a portfolio by its ID
    @GetMapping("/{id}/public-link")
    public String getPublicLink(@PathVariable Long id) {
        PortfolioEntity portfolio = service.getById(id)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        return serverUrl + "/api/portfolios/public/" + portfolio.getPublicToken();
    }
}

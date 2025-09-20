package cit.edu.portfolioX.Security;

import cit.edu.portfolioX.Entity.Role;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Entity.UserEntity.UserStatus;
import cit.edu.portfolioX.Repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@Component
public class GitHubOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GitHubOAuth2SuccessHandler.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        
        try {
            // Get GitHub user info
            String githubLogin = oauth2User.getAttribute("login");
            String githubName = oauth2User.getAttribute("name");
            String githubEmail = oauth2User.getAttribute("email");
            String githubAvatarUrl = oauth2User.getAttribute("avatar_url");
            
            // If email is not public, fetch it from GitHub API
            if (githubEmail == null) {
                githubEmail = fetchGitHubEmail(oauth2User.getAttribute("access_token"));
            }
            
            logger.info("GitHub OAuth2 login attempt for user: {}", githubLogin);
            
            // Check if user already exists by GitHub username or email
            UserEntity existingUser = userRepository.findByUsername(githubLogin);
            if (existingUser == null && githubEmail != null) {
                existingUser = userRepository.findByUserEmail(githubEmail);
            }
            
            UserEntity user;
            if (existingUser != null) {
                // Update existing user with GitHub info
                user = existingUser;
                if (githubAvatarUrl != null) {
                    user.setProfilePic(githubAvatarUrl);
                }
                logger.info("Updated existing user with GitHub info: {}", githubLogin);
            } else {
                // Create new user
                user = new UserEntity();
                user.setUsername(githubLogin);
                user.setUserEmail(githubEmail != null ? githubEmail : githubLogin + "@github.local");
                
                // Parse name if available
                if (githubName != null && !githubName.trim().isEmpty()) {
                    String[] nameParts = githubName.trim().split(" ", 2);
                    user.setFname(nameParts[0]);
                    if (nameParts.length > 1) {
                        user.setLname(nameParts[1]);
                    } else {
                        user.setLname("");
                    }
                } else {
                    user.setFname(githubLogin);
                    user.setLname("");
                }
                
                // Set default role as STUDENT and auto-approve
                user.setRole(Role.STUDENT);
                user.setStatus(UserStatus.APPROVED);
                user.setPassword(""); // No password for OAuth users
                
                if (githubAvatarUrl != null) {
                    user.setProfilePic(githubAvatarUrl);
                }
                
                logger.info("Created new user from GitHub OAuth: {}", githubLogin);
            }
            
            // Save user to database
            userRepository.save(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());
            
            // Redirect to frontend with token
            String redirectUrl = String.format(
                "http://localhost:5173/auth/github-callback?token=%s&userId=%d&username=%s&role=%s&profilePic=%s",
                token,
                user.getUserID(),
                user.getUsername(),
                user.getRole().toString(),
                user.getProfilePic() != null ? user.getProfilePic() : ""
            );
            
            logger.info("GitHub OAuth2 login successful for user: {}, redirecting to: {}", githubLogin, redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            
        } catch (Exception e) {
            logger.error("Error during GitHub OAuth2 authentication: {}", e.getMessage(), e);
            String errorUrl = "http://localhost:5173/auth/login?error=oauth_error";
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
    
    private String fetchGitHubEmail(String accessToken) {
        try {
            String url = "https://api.github.com/user/emails";
            String response = restTemplate.getForObject(url, String.class);
            
            JsonNode emails = objectMapper.readTree(response);
            for (JsonNode email : emails) {
                if (email.get("primary").asBoolean()) {
                    return email.get("email").asText();
                }
            }
            
            // If no primary email found, return the first one
            if (emails.isArray() && emails.size() > 0) {
                return emails.get(0).get("email").asText();
            }
            
        } catch (Exception e) {
            logger.warn("Could not fetch GitHub email: {}", e.getMessage());
        }
        
        return null;
    }
}

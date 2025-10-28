package cit.edu.portfolioX.Security;

import cit.edu.portfolioX.DTO.LoginRequestDTO;
import cit.edu.portfolioX.DTO.SignupRequestDTO;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Entity.UserEntity.UserStatus;
import cit.edu.portfolioX.Repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
@CrossOrigin(origins = {"https://portfolixcapstone.netlify.app", "http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Operation(summary = "Register a new user", description = "Creates a new user account with the provided details")
    @PostMapping("/signup")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequestDTO req) {
        if (userRepository.findByUsername(req.getUsername()) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken!"));
        }

        if (userRepository.findByUserEmail(req.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered!"));
        }

        if (req.getRole() == cit.edu.portfolioX.Entity.Role.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot create admin account via signup."));
        }

        UserEntity user = new UserEntity();
        user.setFname(req.getFname());
        user.setLname(req.getLname());
        user.setUserEmail(req.getEmail());
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(req.getRole());

        if (req.getRole() == cit.edu.portfolioX.Entity.Role.STUDENT) {
            user.setStatus(UserStatus.APPROVED);
        } else if (req.getRole() == cit.edu.portfolioX.Entity.Role.FACULTY) {
            user.setStatus(UserStatus.PENDING);
        }

        userRepository.save(user);
        if (req.getRole() == cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.ok(Map.of("message", "Faculty account created. Awaiting admin approval."));
        }
        return ResponseEntity.ok(Map.of("message", "User registered successfully."));
    }

    @Operation(summary = "Login user", description = "Authenticates user and returns JWT token")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO login) {
        logger.info("Login attempt for username: {}", login.getUsername());
        
        UserEntity user = userRepository.findByUsername(login.getUsername());
        if (user == null) {
            logger.warn("Login failed: User not found - {}", login.getUsername());
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        if (!encoder.matches(login.getPassword(), user.getPassword())) {
            logger.warn("Login failed: Invalid password for user - {}", login.getUsername());
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        if (user.getStatus() != UserStatus.APPROVED) {
            return ResponseEntity.status(403).body(Map.of("error", "Account not approved."));
        }

        String token = jwtUtil.generateToken(user.getUsername());
        logger.info("Login successful for user: {}", login.getUsername());
        return ResponseEntity.ok(Map.of(
            "token", token,
            "userId", user.getUserID(),
            "username", user.getUsername(),
            "fname", user.getFname(),
            "lname", user.getLname(),
            "role", user.getRole().toString()
        ));
    }

    @PatchMapping("/approve/{userId}")
    public ResponseEntity<?> approveFaculty(@PathVariable Long userId, @RequestParam boolean approve, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        String username = jwtUtil.extractUsername(token);
        UserEntity admin = userRepository.findByUsername(username);
        if (admin == null || admin.getRole() != cit.edu.portfolioX.Entity.Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Only admin can approve/reject faculty."));
        }

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found or not a faculty."));
        }

        user.setStatus(approve ? UserStatus.APPROVED : UserStatus.REJECTED);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Faculty " + (approve ? "approved" : "rejected") + " successfully."));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserData(@PathVariable Long userId, @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity requestingUser = userRepository.findByUsername(username);
            
            if (requestingUser == null || !requestingUser.getUserID().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access"));
            }

            UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(Map.of(
                "userId", user.getUserID(),
                "username", user.getUsername(),
                "fname", user.getFname(),
                "lname", user.getLname(),
                "userEmail", user.getUserEmail(),
                "role", user.getRole().toString(),
                "profilePic", user.getProfilePic() != null ? user.getProfilePic() : ""
            ));
        } catch (Exception e) {
            logger.error("Error fetching user data: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching user data"));
        }
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestParam(required = false) String fname,
            @RequestParam(required = false) String lname,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String currentPassword,
            @RequestParam(required = false) String newPassword,
            @RequestParam(required = false) MultipartFile profilePic,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity requestingUser = userRepository.findByUsername(username);
            
            if (requestingUser == null || !requestingUser.getUserID().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access"));
            }

            UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (fname != null) user.setFname(fname);
            if (lname != null) user.setLname(lname);
            if (email != null) {
                UserEntity existingUser = userRepository.findByUserEmail(email);
                if (existingUser != null && !existingUser.getUserID().equals(userId)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered"));
                }
                user.setUserEmail(email);
            }

            // Handle password change with verification
            if (newPassword != null) {
                if (currentPassword == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Current password is required"));
                }
                
                // Verify current password
                if (!encoder.matches(currentPassword, user.getPassword())) {
                    return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect"));
                }
                
                // Update to new password
                user.setPassword(encoder.encode(newPassword));
            }
            
            if (profilePic != null && !profilePic.isEmpty()) {
                try {
                    // Validate file type
                    String contentType = profilePic.getContentType();
                    if (!contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
                        logger.error("Invalid file type: {}", contentType);
                        return ResponseEntity.badRequest().body(Map.of("error", "Only JPEG and PNG files are allowed"));
                    }

                    // Check file size (max 1MB)
                    if (profilePic.getSize() > 1024 * 1024) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Image file too large. Maximum size is 1MB"));
                    }

                    // Save file in user-specific directory for data isolation
                    String userDir = "user_" + userId;
                    String fileName = UUID.randomUUID() + "_" + profilePic.getOriginalFilename();
                    Path filePath = Paths.get(uploadDir, userDir, fileName);
                    Files.createDirectories(filePath.getParent());
                    Files.write(filePath, profilePic.getBytes());

                    // Store URL path instead of file system path
                    user.setProfilePic("/uploads/" + userDir + "/" + fileName);
                    logger.info("Profile picture saved successfully at: {}. Size: {} bytes", filePath, profilePic.getSize());
                } catch (Exception e) {
                    logger.error("Error saving profile picture: {}", e.getMessage());
                    return ResponseEntity.status(500).body(Map.of("error", "Error saving profile picture"));
                }
            }

            user.setLastUpdated(LocalDateTime.now());
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "message", "User updated successfully",
                "userId", user.getUserID(),
                "username", user.getUsername(),
                "fname", user.getFname(),
                "lname", user.getLname(),
                "userEmail", user.getUserEmail(),
                "role", user.getRole().toString(),
                "profilePic", user.getProfilePic() != null ? user.getProfilePic() : ""
            ));
        } catch (Exception e) {
            logger.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error updating user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity requestingUser = userRepository.findByUsername(username);
            
            if (requestingUser == null || !requestingUser.getUserID().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access"));
            }

            UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting user"));
        }
    }

    @Operation(summary = "Get GitHub OAuth2 login URL", description = "Returns the GitHub OAuth2 authorization URL")
    @GetMapping("/github/login")
    public ResponseEntity<?> getGitHubLoginUrl() {
        String githubAuthUrl = "http://localhost:8080/oauth2/authorization/github";
        return ResponseEntity.ok(Map.of("authUrl", githubAuthUrl));
    }

    @Operation(summary = "Handle GitHub OAuth2 callback", description = "Processes GitHub OAuth2 callback and returns user data")
    @GetMapping("/github/callback")
    public ResponseEntity<?> handleGitHubCallback(@RequestParam(required = false) String code, 
                                                @RequestParam(required = false) String error) {
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "GitHub OAuth2 error: " + error));
        }
        
        if (code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authorization code not provided"));
        }
        
        // This endpoint is mainly for documentation - the actual OAuth2 flow is handled by Spring Security
        return ResponseEntity.ok(Map.of("message", "OAuth2 callback received. Please use the OAuth2 login URL."));
    }
}
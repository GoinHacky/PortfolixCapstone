package cit.edu.portfolioX.Security;

import cit.edu.portfolioX.DTO.LoginRequestDTO;
import cit.edu.portfolioX.DTO.SignupRequestDTO;
import cit.edu.portfolioX.DTO.JwtResponseDTO;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Entity.UserEntity.UserStatus;
import cit.edu.portfolioX.Repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Operation(summary = "Register a new user", description = "Creates a new user account with the provided details")
    @PostMapping("/signup")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequestDTO req) {
        if (userRepository.findByUsername(req.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        if (userRepository.findByUserEmail(req.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }

        if (req.getRole() == cit.edu.portfolioX.Entity.Role.ADMIN) {
            return ResponseEntity.badRequest().body("Cannot create admin account via signup.");
        }

        UserEntity user = new UserEntity();
        user.setFname(req.getFname());
        user.setLname(req.getLname());
        user.setUserEmail(req.getEmail());
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(req.getRole());

        // Students are auto-approved, faculty require admin approval
        if (req.getRole() == cit.edu.portfolioX.Entity.Role.STUDENT) {
            user.setStatus(UserStatus.APPROVED);
        } else if (req.getRole() == cit.edu.portfolioX.Entity.Role.FACULTY) {
            user.setStatus(UserStatus.PENDING);
        }

        userRepository.save(user);
        if (req.getRole() == cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.ok("Faculty account created. Awaiting admin approval.");
        }
        return ResponseEntity.ok("User registered successfully.");
    }

    @Operation(summary = "Login user", description = "Authenticates user and returns JWT token")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO login) {
        logger.info("Login attempt for username: {}", login.getUsername());
        
        UserEntity user = userRepository.findByUsername(login.getUsername());
        if (user == null) {
            logger.warn("Login failed: User not found - {}", login.getUsername());
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        if (!encoder.matches(login.getPassword(), user.getPassword())) {
            logger.warn("Login failed: Invalid password for user - {}", login.getUsername());
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        if (user.getStatus() != UserStatus.APPROVED) {
            return ResponseEntity.status(403).body("Account not approved.");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        logger.info("Login successful for user: {}", login.getUsername());
        return ResponseEntity.ok(new JwtResponseDTO(token, user.getUserID(), user.getUsername(), user.getRole()));
    }

    // Admin-only: Approve or reject faculty accounts
    @PatchMapping("/approve/{userId}")
    public ResponseEntity<?> approveFaculty(@PathVariable Long userId, @RequestParam boolean approve, @RequestHeader("Authorization") String authHeader) {
        // Only admin can approve
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        String username = jwtUtil.extractUsername(token);
        UserEntity admin = userRepository.findByUsername(username);
        if (admin == null || admin.getRole() != cit.edu.portfolioX.Entity.Role.ADMIN) {
            return ResponseEntity.status(403).body("Only admin can approve/reject faculty.");
        }

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.badRequest().body("User not found or not a faculty.");
        }
        user.setStatus(approve ? UserStatus.APPROVED : UserStatus.REJECTED);
        userRepository.save(user);
        return ResponseEntity.ok("Faculty " + (approve ? "approved" : "rejected") + " successfully.");
    }
}

package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.Role;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Service.UserService;
import cit.edu.portfolioX.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService service;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<UserEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public UserEntity create(@RequestBody UserEntity user) {
        return service.save(user);
    }

    @PutMapping("/{id}")
    public UserEntity update(@PathVariable Long id, @RequestBody UserEntity user) {
        user.setUserID(id);
        return service.save(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Get all students
    @GetMapping("/students")
    public ResponseEntity<List<UserEntity>> getAllStudents() {
        List<UserEntity> students = service.getAllStudents();
        return ResponseEntity.ok(students);
    }

    // Get all faculty
    @GetMapping("/faculty")
    public ResponseEntity<List<UserEntity>> getAllFaculty() {
        try {
            logger.info("Fetching all faculty members");
            List<UserEntity> faculty = service.getAll().stream()
                .filter(user -> user.getRole() == Role.FACULTY)
                .collect(Collectors.toList());
            logger.info("Found {} faculty members", faculty.size());
            return ResponseEntity.ok(faculty);
        } catch (Exception e) {
            logger.error("Error fetching faculty members: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get pending faculty requests
    @GetMapping("/faculty/pending")
    public ResponseEntity<List<UserEntity>> getPendingFaculty() {
        try {
            logger.info("Fetching pending faculty requests");
            List<UserEntity> pendingFaculty = service.getAll().stream()
                .filter(user -> user.getRole() == Role.FACULTY && 
                              user.getStatus() == UserEntity.UserStatus.PENDING)
                .collect(Collectors.toList());
            logger.info("Found {} pending faculty requests", pendingFaculty.size());
            return ResponseEntity.ok(pendingFaculty);
        } catch (Exception e) {
            logger.error("Error fetching pending faculty requests: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Search students by name or email
    @GetMapping("/students/search")
    public ResponseEntity<List<UserEntity>> searchStudents(@RequestParam String q) {
        List<UserEntity> students = service.searchStudents(q);
        return ResponseEntity.ok(students);
    }

    @PatchMapping("/students/{userId}/reset-password")
    public ResponseEntity<?> resetStudentPassword(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity admin = userService.findByUsername(username);

            if (admin == null || admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Only admin can reset student passwords"));
            }

            UserEntity student = service.getById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

            if (student.getRole() != Role.STUDENT) {
                return ResponseEntity.status(400).body(Map.of("error", "User is not a student"));
            }

            // Generate a temporary password (e.g., first 4 chars of username + last 4 digits of userId)
            String tempPassword = student.getUsername().substring(0, Math.min(4, student.getUsername().length())) 
                                + String.format("%04d", userId % 10000);
            
            student.setPassword(encoder.encode(tempPassword));
            service.save(student);

            return ResponseEntity.ok(Map.of(
                "message", "Password reset successful",
                "temporaryPassword", tempPassword
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error resetting password: " + e.getMessage()));
        }
    }

    @DeleteMapping("/students/{userId}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity admin = userService.findByUsername(username);

            if (admin == null || admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Only admin can delete student accounts"));
            }

            UserEntity student = service.getById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

            if (student.getRole() != Role.STUDENT) {
                return ResponseEntity.status(400).body(Map.of("error", "User is not a student"));
            }

            service.delete(userId);
            return ResponseEntity.ok(Map.of("message", "Student account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting student: " + e.getMessage()));
        }
    }

    @PatchMapping("/faculty/{userId}/reset-password")
    public ResponseEntity<?> resetFacultyPassword(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity admin = userService.findByUsername(username);

            if (admin == null || admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Only admin can reset faculty passwords"));
            }

            UserEntity faculty = service.getById(userId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

            if (faculty.getRole() != Role.FACULTY) {
                return ResponseEntity.status(400).body(Map.of("error", "User is not a faculty member"));
            }

            if (faculty.getStatus() != UserEntity.UserStatus.APPROVED) {
                return ResponseEntity.status(400).body(Map.of("error", "Can only reset passwords for approved faculty members"));
            }

            // Generate a temporary password (e.g., first 4 chars of username + last 4 digits of userId)
            String tempPassword = faculty.getUsername().substring(0, Math.min(4, faculty.getUsername().length())) 
                                + String.format("%04d", userId % 10000);
            
            faculty.setPassword(encoder.encode(tempPassword));
            service.save(faculty);

            return ResponseEntity.ok(Map.of(
                "message", "Password reset successful",
                "temporaryPassword", tempPassword
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error resetting password: " + e.getMessage()));
        }
    }

    @DeleteMapping("/faculty/{userId}")
    public ResponseEntity<?> deleteFaculty(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity admin = userService.findByUsername(username);

            if (admin == null || admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Only admin can delete faculty accounts"));
            }

            UserEntity faculty = service.getById(userId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

            if (faculty.getRole() != Role.FACULTY) {
                return ResponseEntity.status(400).body(Map.of("error", "User is not a faculty member"));
            }

            service.delete(userId);
            return ResponseEntity.ok(Map.of("message", "Faculty account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting faculty: " + e.getMessage()));
        }
    }
}

package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.CourseEntity;
import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Service.CourseService;
import cit.edu.portfolioX.Service.PortfolioService;
import cit.edu.portfolioX.Service.UserService;
import cit.edu.portfolioX.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CourseController {
    @Autowired
    private CourseService courseService;
    @Autowired
    private PortfolioService portfolioService;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    // Create a course (faculty only)
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseEntity course, @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        var faculty = userService.findByUsername(username);
        if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.status(403).body("Only faculty can create courses");
        }
        course.setCreatedBy(faculty.getUserID());
        course.setCreatedByName(faculty.getFname() + " " + faculty.getLname());
        // Check for duplicate course code
        if (courseService.findByCourseCode(course.getCourseCode()).isPresent()) {
            return ResponseEntity.badRequest().body("Course code already exists");
        }
        CourseEntity saved = courseService.save(course);
        return ResponseEntity.ok(saved);
    }

    // List all courses
    @GetMapping
    public List<CourseEntity> getAllCourses() {
        return courseService.getAll();
    }

    // List courses by faculty
    @GetMapping("/faculty/{facultyId}")
    public List<CourseEntity> getCoursesByFaculty(@PathVariable Long facultyId) {
        return courseService.findByCreatedBy(facultyId);
    }

    // List projects under a course code
    @GetMapping("/{courseCode}/projects")
    public ResponseEntity<?> getProjectsByCourseCode(@PathVariable String courseCode, @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        var faculty = userService.findByUsername(username);
        if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.status(403).body("Only faculty can view projects by course");
        }
        Optional<CourseEntity> courseOpt = courseService.findByCourseCode(courseCode);
        if (courseOpt.isEmpty() || !courseOpt.get().getCreatedBy().equals(faculty.getUserID())) {
            return ResponseEntity.status(403).body("You can only view projects for your own courses");
        }
        List<PortfolioEntity> projects = portfolioService.getAll().stream()
            .filter(p -> courseCode.equalsIgnoreCase(p.getCourseCode()) && "project".equalsIgnoreCase(p.getCategory()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }
} 
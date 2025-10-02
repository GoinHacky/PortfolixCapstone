package cit.edu.portfolioX.Controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cit.edu.portfolioX.Entity.CourseEntity;
import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Security.JwtUtil;
import cit.edu.portfolioX.Service.CourseService;
import cit.edu.portfolioX.Service.CourseEnrollmentService;
import cit.edu.portfolioX.Service.PortfolioService;
import cit.edu.portfolioX.Service.UserService;

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
    @Autowired
    private CourseEnrollmentService enrollmentService;

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

    // List courses a student is enrolled in (by portfolios' courseCode)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getCoursesByStudent(
            @PathVariable Long studentId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            var requester = userService.findByUsername(username);
            if (requester == null) {
                return ResponseEntity.status(401).body("Invalid user");
            }

            // Students can only view their own courses; faculty/admin can view any
            boolean isSelf = requester.getUserID().equals(studentId);
            boolean isPrivileged = requester.getRole() == cit.edu.portfolioX.Entity.Role.FACULTY
                    || requester.getRole() == cit.edu.portfolioX.Entity.Role.ADMIN;
            if (!isSelf && !isPrivileged) {
                return ResponseEntity.status(403).body("Unauthorized access");
            }

            List<PortfolioEntity> studentPortfolios = portfolioService.findByUserId(studentId);
            var portfolioCodes = studentPortfolios.stream()
                    .map(PortfolioEntity::getCourseCode)
                    .filter(code -> code != null && !code.isBlank())
                    .collect(Collectors.toList());

            var enrollmentCodes = enrollmentService.findByStudent(studentId).stream()
                    .map(e -> e.getCourseCode())
                    .collect(Collectors.toList());

            var courseCodes = java.util.stream.Stream.concat(portfolioCodes.stream(), enrollmentCodes.stream())
                    .distinct()
                    .collect(Collectors.toList());

            List<CourseEntity> courses = courseCodes.stream()
                    .map(code -> courseService.findByCourseCode(code))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching student courses: " + e.getMessage());
        }
    }

    // List projects under a course code (only those tied to this course)
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
            .filter(p -> "project".equalsIgnoreCase(p.getCategory()))
            .filter(p -> courseCode.equalsIgnoreCase(p.getCourseCode()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }

    // List projects by course and specific student
    @GetMapping("/{courseCode}/students/{studentId}/projects")
    public ResponseEntity<?> getProjectsByCourseAndStudent(
            @PathVariable String courseCode,
            @PathVariable Long studentId,
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        var faculty = userService.findByUsername(username);
        if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.status(403).body("Only faculty can view projects by course and student");
        }
        Optional<CourseEntity> courseOpt = courseService.findByCourseCode(courseCode);
        if (courseOpt.isEmpty() || !courseOpt.get().getCreatedBy().equals(faculty.getUserID())) {
            return ResponseEntity.status(403).body("You can only view projects for your own courses");
        }

        List<PortfolioEntity> projects = portfolioService.getAll().stream()
            .filter(p -> "project".equalsIgnoreCase(p.getCategory()))
            .filter(p -> courseCode.equalsIgnoreCase(p.getCourseCode()))
            .filter(p -> p.getUserID() != null && p.getUserID().equals(studentId))
            .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }

    // List students enrolled in a course (faculty can only view their own courses)
    @GetMapping("/{courseCode}/students")
    public ResponseEntity<?> getStudentsByCourseCode(@PathVariable String courseCode, @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        var faculty = userService.findByUsername(username);
        if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
            return ResponseEntity.status(403).body("Only faculty can view course enrollments");
        }
        Optional<CourseEntity> courseOpt = courseService.findByCourseCode(courseCode);
        if (courseOpt.isEmpty() || !courseOpt.get().getCreatedBy().equals(faculty.getUserID())) {
            return ResponseEntity.status(403).body("You can only view enrollments for your own courses");
        }

        var enrollments = enrollmentService.findByCourse(courseCode);
        var students = enrollments.stream()
            .map(e -> userService.getById(e.getStudentId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(u -> java.util.Map.of(
                "userID", u.getUserID(),
                "fname", u.getFname(),
                "lname", u.getLname(),
                "username", u.getUsername(),
                "userEmail", u.getUserEmail()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(students);
    }

    // Add student to course (faculty only) — records enrollment without altering unrelated portfolios
    @PostMapping("/{courseCode}/add-student/{studentId}")
    public ResponseEntity<?> addStudentToCourse(
            @PathVariable String courseCode,
            @PathVariable Long studentId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            var faculty = userService.findByUsername(username);
            
            if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
                return ResponseEntity.status(403).body("Only faculty can add students to courses");
            }
            
            // Check if course exists and belongs to this faculty
            Optional<CourseEntity> courseOpt = courseService.findByCourseCode(courseCode);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Course not found");
            }
            
            CourseEntity course = courseOpt.get();
            if (!course.getCreatedBy().equals(faculty.getUserID())) {
                return ResponseEntity.status(403).body("You can only add students to your own courses");
            }
            
            // Check if student exists
            var student = userService.getById(studentId);
            if (student.isEmpty()) {
                return ResponseEntity.status(404).body("Student not found");
            }
            
            if (student.get().getRole() != cit.edu.portfolioX.Entity.Role.STUDENT) {
                return ResponseEntity.status(400).body("User is not a student");
            }
            
            // Check if student is already enrolled in this course (via enrollment table)
            if (enrollmentService.findByCourseCodeAndStudent(courseCode, studentId).isPresent()) {
                return ResponseEntity.status(400).body("Student is already enrolled in this course");
            }

            // Create enrollment record
            var enrollment = new cit.edu.portfolioX.Entity.CourseEnrollmentEntity();
            enrollment.setCourseCode(courseCode);
            enrollment.setStudentId(studentId);
            enrollmentService.save(enrollment);

            return ResponseEntity.ok("Student enrolled in course successfully");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding student to course: " + e.getMessage());
        }
    }

    // Remove student from course (faculty only)
    @DeleteMapping("/{courseCode}/remove-student/{studentId}")
    public ResponseEntity<?> removeStudentFromCourse(
            @PathVariable String courseCode,
            @PathVariable Long studentId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            var faculty = userService.findByUsername(username);
            
            if (faculty == null || faculty.getRole() != cit.edu.portfolioX.Entity.Role.FACULTY) {
                return ResponseEntity.status(403).body("Only faculty can remove students from courses");
            }
            
            // Check if course exists and belongs to this faculty
            Optional<CourseEntity> courseOpt = courseService.findByCourseCode(courseCode);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Course not found");
            }
            
            CourseEntity course = courseOpt.get();
            if (!course.getCreatedBy().equals(faculty.getUserID())) {
                return ResponseEntity.status(403).body("You can only remove students from your own courses");
            }
            
            // Check if student exists
            var student = userService.getById(studentId);
            if (student.isEmpty()) {
                return ResponseEntity.status(404).body("Student not found");
            }
            
            if (student.get().getRole() != cit.edu.portfolioX.Entity.Role.STUDENT) {
                return ResponseEntity.status(400).body("User is not a student");
            }
            
            var existing = enrollmentService.findByCourseCodeAndStudent(courseCode, studentId);
            if (existing.isPresent()) {
                enrollmentService.delete(existing.get());
                return ResponseEntity.ok("Student removed from course successfully");
            }
            return ResponseEntity.status(404).body("Student was not enrolled in this course");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error removing student from course: " + e.getMessage());
        }
    }
} 
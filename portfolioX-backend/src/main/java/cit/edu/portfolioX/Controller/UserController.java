package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService service;

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

    @PutMapping("/{id}/approve")
    public UserEntity approveUser(@PathVariable Long id) {
        Optional<UserEntity> userOpt = service.getById(id);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            user.setStatus(UserEntity.UserStatus.APPROVED);
            return service.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    // Get all students
    @GetMapping("/students")
    public List<UserEntity> getAllStudents() {
        return service.getAllStudents();
    }

    // Search students by name or email (query param: q)
    @GetMapping("/students/search")
    public List<UserEntity> searchStudents(@RequestParam("q") String query) {
        return service.searchStudents(query);
    }
}


package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.ProjectEntity;
import cit.edu.portfolioX.Service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService service;

    @GetMapping
    public List<ProjectEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<ProjectEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ProjectEntity create(@RequestBody ProjectEntity project) {
        return service.save(project);
    }

    @PutMapping("/{id}")
    public ProjectEntity update(@PathVariable Long id, @RequestBody ProjectEntity project) {
        project.setProjectID(id);
        return service.save(project);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

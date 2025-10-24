
package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.SkillEntity;
import cit.edu.portfolioX.Service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://portfolixcapstone.netlify.app"})
public class SkillController {

    @Autowired
    private SkillService service;

    @GetMapping
    public List<SkillEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<SkillEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public SkillEntity create(@RequestBody SkillEntity skill) {
        return service.save(skill);
    }

    @PutMapping("/{id}")
    public SkillEntity update(@PathVariable Long id, @RequestBody SkillEntity skill) {
        skill.setSkillID(id);
        return service.save(skill);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

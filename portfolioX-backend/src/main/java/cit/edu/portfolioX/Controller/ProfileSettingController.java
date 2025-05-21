
package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.ProfileSettingEntity;
import cit.edu.portfolioX.Service.ProfileSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
public class ProfileSettingController {

    @Autowired
    private ProfileSettingService service;

    @GetMapping
    public List<ProfileSettingEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<ProfileSettingEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ProfileSettingEntity create(@RequestBody ProfileSettingEntity setting) {
        return service.save(setting);
    }

    @PutMapping("/{id}")
    public ProfileSettingEntity update(@PathVariable Long id, @RequestBody ProfileSettingEntity setting) {
        setting.setSettingID(id);
        return service.save(setting);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

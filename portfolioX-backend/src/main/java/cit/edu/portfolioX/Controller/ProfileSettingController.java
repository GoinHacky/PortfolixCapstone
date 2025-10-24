package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.ProfileSettingEntity;
import cit.edu.portfolioX.Service.ProfileSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://portfolixcapstone.netlify.app"})
public class ProfileSettingController {

    @Autowired
    private ProfileSettingService service;

    @GetMapping
    public List<ProfileSettingEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<ProfileSettingEntity>> getById(@PathVariable Long id) {
        List<ProfileSettingEntity> settings = service.findByUserId(id);
        return ResponseEntity.ok(settings != null ? settings : new ArrayList<>());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody List<ProfileSettingEntity> settings) {
        try {
            List<ProfileSettingEntity> savedSettings = new ArrayList<>();
            for (ProfileSettingEntity setting : settings) {
                savedSettings.add(service.save(setting));
            }
            return ResponseEntity.ok(savedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating settings: " + e.getMessage());
        }
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

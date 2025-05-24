
package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.CertificationEntity;
import cit.edu.portfolioX.Service.CertificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/certifications")
public class CertificationController {

    @Autowired
    private CertificationService service;

    @GetMapping
    public List<CertificationEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<CertificationEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public CertificationEntity create(@RequestBody CertificationEntity cert) {
        return service.save(cert);
    }

    @PutMapping("/{id}")
    public CertificationEntity update(@PathVariable Long id, @RequestBody CertificationEntity cert) {
        cert.setCertID(id);
        return service.save(cert);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

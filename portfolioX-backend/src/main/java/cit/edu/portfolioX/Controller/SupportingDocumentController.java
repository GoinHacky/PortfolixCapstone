
package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.SupportingDocumentEntity;
import cit.edu.portfolioX.Service.SupportingDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class SupportingDocumentController {

    @Autowired
    private SupportingDocumentService service;

    @GetMapping
    public List<SupportingDocumentEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<SupportingDocumentEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public SupportingDocumentEntity create(@RequestBody SupportingDocumentEntity doc) {
        return service.save(doc);
    }

    @PutMapping("/{id}")
    public SupportingDocumentEntity update(@PathVariable Long id, @RequestBody SupportingDocumentEntity doc) {
        doc.setSdID(id);
        return service.save(doc);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}


package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.LinkEntity;
import cit.edu.portfolioX.Service.LinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    @Autowired
    private LinkService service;

    @GetMapping
    public List<LinkEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<LinkEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public LinkEntity create(@RequestBody LinkEntity link) {
        return service.save(link);
    }

    @PutMapping("/{id}")
    public LinkEntity update(@PathVariable Long id, @RequestBody LinkEntity link) {
        link.setPortfolioID(id);
        return service.save(link);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

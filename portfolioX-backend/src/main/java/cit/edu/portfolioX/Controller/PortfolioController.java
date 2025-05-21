
package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

    @Autowired
    private PortfolioService service;

    @GetMapping
    public List<PortfolioEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<PortfolioEntity> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public PortfolioEntity create(@RequestBody PortfolioEntity portfolio) {
        return service.save(portfolio);
    }

    @PutMapping("/{id}")
    public PortfolioEntity update(@PathVariable Long id, @RequestBody PortfolioEntity portfolio) {
        portfolio.setUserID(id);
        return service.save(portfolio);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

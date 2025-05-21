
package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Repository.PortfolioRepository;

@Service
public class PortfolioService {
    @Autowired
    private PortfolioRepository portfolioRepository;

    public List<PortfolioEntity> getAll() {
        return portfolioRepository.findAll();
    }

    public Optional<PortfolioEntity> getById(Long id) {
        return portfolioRepository.findById(id);
    }

    public PortfolioEntity save(PortfolioEntity portfolio) {
        return portfolioRepository.save(portfolio);
    }

    public void delete(Long id) {
        portfolioRepository.deleteById(id);
    }
}

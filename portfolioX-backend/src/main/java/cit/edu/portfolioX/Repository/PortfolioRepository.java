package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cit.edu.portfolioX.Entity.PortfolioEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<PortfolioEntity, Long> {
    List<PortfolioEntity> findByUser_UserID(Long userId);
    Optional<PortfolioEntity> findByPublicToken(String publicToken);
}

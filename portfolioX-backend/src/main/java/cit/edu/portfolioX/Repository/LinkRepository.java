package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cit.edu.portfolioX.Entity.LinkEntity;
import java.util.Optional;

@Repository
public interface LinkRepository extends JpaRepository<LinkEntity, Long> {
    Optional<LinkEntity> findByPortfolioID(Long portfolioID);
}


package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cit.edu.portfolioX.Entity.PortfolioEntity;
import cit.edu.portfolioX.Entity.SkillEntity;

@Repository
public interface SkillRepository extends JpaRepository<SkillEntity, Long> {
    void deleteByPortfolio(PortfolioEntity portfolio);
}

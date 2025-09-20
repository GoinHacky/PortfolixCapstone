package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cit.edu.portfolioX.Entity.CertificationEntity;

@Repository
public interface CertificationRepository extends JpaRepository<CertificationEntity, Long> {}

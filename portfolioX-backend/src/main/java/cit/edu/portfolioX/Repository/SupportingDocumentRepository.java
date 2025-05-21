
package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cit.edu.portfolioX.Entity.SupportingDocumentEntity;

@Repository
public interface SupportingDocumentRepository extends JpaRepository<SupportingDocumentEntity, Long> {}

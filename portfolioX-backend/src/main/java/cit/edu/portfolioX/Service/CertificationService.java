
package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.CertificationEntity;
import cit.edu.portfolioX.Repository.CertificationRepository;

@Service
public class CertificationService {
    @Autowired
    private CertificationRepository certificationRepository;

    public List<CertificationEntity> getAll() {
        return certificationRepository.findAll();
    }

    public Optional<CertificationEntity> getById(Long id) {
        return certificationRepository.findById(id);
    }

    public CertificationEntity save(CertificationEntity cert) {
        return certificationRepository.save(cert);
    }

    public void delete(Long id) {
        certificationRepository.deleteById(id);
    }
}

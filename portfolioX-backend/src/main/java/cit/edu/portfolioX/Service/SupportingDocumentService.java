
package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.SupportingDocumentEntity;
import cit.edu.portfolioX.Repository.SupportingDocumentRepository;

@Service
public class SupportingDocumentService {
    @Autowired
    private SupportingDocumentRepository docRepository;

    public List<SupportingDocumentEntity> getAll() {
        return docRepository.findAll();
    }

    public Optional<SupportingDocumentEntity> getById(Long id) {
        return docRepository.findById(id);
    }

    public SupportingDocumentEntity save(SupportingDocumentEntity doc) {
        return docRepository.save(doc);
    }

    public void delete(Long id) {
        docRepository.deleteById(id);
    }
}

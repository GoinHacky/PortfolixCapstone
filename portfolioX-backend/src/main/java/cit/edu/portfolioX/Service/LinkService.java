
package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.LinkEntity;
import cit.edu.portfolioX.Repository.LinkRepository;

@Service
public class LinkService {
    @Autowired
    private LinkRepository linkRepository;

    public List<LinkEntity> getAll() {
        return linkRepository.findAll();
    }

    public Optional<LinkEntity> getById(Long id) {
        return linkRepository.findById(id);
    }

    public LinkEntity save(LinkEntity link) {
        return linkRepository.save(link);
    }

    public void delete(Long id) {
        linkRepository.deleteById(id);
    }
}


package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.SkillEntity;
import cit.edu.portfolioX.Repository.SkillRepository;

@Service
public class SkillService {
    @Autowired
    private SkillRepository skillRepository;

    public List<SkillEntity> getAll() {
        return skillRepository.findAll();
    }

    public Optional<SkillEntity> getById(Long id) {
        return skillRepository.findById(id);
    }

    public SkillEntity save(SkillEntity skill) {
        return skillRepository.save(skill);
    }

    public void delete(Long id) {
        skillRepository.deleteById(id);
    }
}


package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.ProjectEntity;
import cit.edu.portfolioX.Repository.ProjectRepository;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    public List<ProjectEntity> getAll() {
        return projectRepository.findAll();
    }

    public Optional<ProjectEntity> getById(Long id) {
        return projectRepository.findById(id);
    }

    public ProjectEntity save(ProjectEntity project) {
        return projectRepository.save(project);
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }
}

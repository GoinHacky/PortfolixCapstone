package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<UserEntity> getAll() {
        return userRepository.findAll();
    }

    public Optional<UserEntity> getById(Long id) {
        return userRepository.findById(id);
    }

    public UserEntity save(UserEntity user) {
        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    public List<UserEntity> getAllStudents() {
        return userRepository.findByRole(cit.edu.portfolioX.Entity.Role.STUDENT);
    }

    public List<UserEntity> searchStudents(String query) {
        return userRepository.findByRoleAndSearch(cit.edu.portfolioX.Entity.Role.STUDENT, query.toLowerCase());
    }

    public UserEntity findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}

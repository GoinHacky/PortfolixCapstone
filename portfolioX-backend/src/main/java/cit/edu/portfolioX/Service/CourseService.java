package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.CourseEntity;
import cit.edu.portfolioX.Repository.CourseRepository;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;

    public List<CourseEntity> getAll() {
        return courseRepository.findAll();
    }

    public Optional<CourseEntity> getById(Long id) {
        return courseRepository.findById(id);
    }

    public CourseEntity save(CourseEntity course) {
        return courseRepository.save(course);
    }

    public void delete(Long id) {
        courseRepository.deleteById(id);
    }

    public List<CourseEntity> findByCreatedBy(Long createdBy) {
        return courseRepository.findByCreatedBy(createdBy);
    }

    public Optional<CourseEntity> findByCourseCode(String courseCode) {
        return courseRepository.findByCourseCode(courseCode);
    }
} 
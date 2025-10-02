package cit.edu.portfolioX.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cit.edu.portfolioX.Entity.CourseEnrollmentEntity;
import cit.edu.portfolioX.Repository.CourseEnrollmentRepository;

@Service
public class CourseEnrollmentService {
    @Autowired
    private CourseEnrollmentRepository repository;

    public CourseEnrollmentEntity save(CourseEnrollmentEntity e) { return repository.save(e); }
    public Optional<CourseEnrollmentEntity> findByCourseCodeAndStudent(String code, Long studentId) {
        return repository.findByCourseCodeAndStudentId(code, studentId);
    }
    public List<CourseEnrollmentEntity> findByStudent(Long studentId) {
        return repository.findByStudentId(studentId);
    }
    public List<CourseEnrollmentEntity> findByCourse(String courseCode) {
        return repository.findByCourseCode(courseCode);
    }
    public void delete(CourseEnrollmentEntity e) { repository.delete(e); }
}



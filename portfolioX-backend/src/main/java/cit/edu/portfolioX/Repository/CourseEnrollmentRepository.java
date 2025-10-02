package cit.edu.portfolioX.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cit.edu.portfolioX.Entity.CourseEnrollmentEntity;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollmentEntity, Long> {
    List<CourseEnrollmentEntity> findByStudentId(Long studentId);
    List<CourseEnrollmentEntity> findByCourseCode(String courseCode);
    Optional<CourseEnrollmentEntity> findByCourseCodeAndStudentId(String courseCode, Long studentId);
}



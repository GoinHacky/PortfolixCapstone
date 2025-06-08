package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cit.edu.portfolioX.Entity.CourseEntity;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    List<CourseEntity> findByCreatedBy(Long createdBy);
    Optional<CourseEntity> findByCourseCode(String courseCode);
} 
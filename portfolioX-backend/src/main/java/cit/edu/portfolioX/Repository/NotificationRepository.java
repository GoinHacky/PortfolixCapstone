package cit.edu.portfolioX.Repository;

import cit.edu.portfolioX.Entity.NotificationEntity;
import cit.edu.portfolioX.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    
    List<NotificationEntity> findByUserOrderByCreatedAtDesc(UserEntity user);
    
    List<NotificationEntity> findByUserAndIsReadFalseOrderByCreatedAtDesc(UserEntity user);
    
    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE n.user = :user AND n.isRead = false")
    long countUnreadNotifications(@Param("user") UserEntity user);
    
    @Query("SELECT n FROM NotificationEntity n WHERE n.user = :user ORDER BY n.createdAt DESC LIMIT :limit")
    List<NotificationEntity> findRecentNotifications(@Param("user") UserEntity user, @Param("limit") int limit);
}

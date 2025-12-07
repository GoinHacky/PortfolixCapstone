package cit.edu.portfolioX.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_entity")
public class NotificationEntity {
    public enum NotificationType {
        FACULTY_REQUEST,      // Faculty approval request for admin
        FACULTY_APPROVED,     // Faculty account approved notification
        FACULTY_REJECTED,     // Faculty account rejected notification
        PROJECT_SUBMISSION,   // Student submitted a project
        PROJECT_VALIDATED,    // Student's project was validated by faculty
        PROJECT_UNVALIDATED,  // Student's project validation was removed
        MICROCREDENTIAL_WITNESSED,  // Student's microcredential was witnessed by faculty
        MICROCREDENTIAL_UNWITNESSED, // Faculty removed witness from microcredential
        COURSE_ENROLLMENT,    // Student enrolled in a course
        GRADE_POSTED,         // Teacher posted a grade
        PORTFOLIO_VIEWED,     // Someone viewed student's portfolio
        SYSTEM_MESSAGE        // General system message
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(name = "related_user_id")
    private Long relatedUserId;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "related_entity_type")
    private String relatedEntityType; // e.g., "PROJECT", "COURSE", "PORTFOLIO"

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime readAt;

    public NotificationEntity() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Long getRelatedUserId() {
        return relatedUserId;
    }

    public void setRelatedUserId(Long relatedUserId) {
        this.relatedUserId = relatedUserId;
    }

    public Long getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(Long relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }

    public String getRelatedEntityType() {
        return relatedEntityType;
    }

    public void setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}

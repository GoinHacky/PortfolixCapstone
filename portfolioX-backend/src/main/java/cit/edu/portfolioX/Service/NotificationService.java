package cit.edu.portfolioX.Service;

import cit.edu.portfolioX.Entity.NotificationEntity;
import cit.edu.portfolioX.Entity.NotificationEntity.NotificationType;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Repository.NotificationRepository;
import cit.edu.portfolioX.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a notification for a user
     */
    public NotificationEntity createNotification(UserEntity user, NotificationType type, String title, String message) {
        return createNotification(user, type, title, message, null, null, null);
    }

    /**
     * Create a notification with related entity information
     */
    public NotificationEntity createNotification(
            UserEntity user,
            NotificationType type,
            String title,
            String message,
            Long relatedUserId,
            Long relatedEntityId,
            String relatedEntityType) {
        try {
            NotificationEntity notification = new NotificationEntity();
            notification.setUser(user);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRelatedUserId(relatedUserId);
            notification.setRelatedEntityId(relatedEntityId);
            notification.setRelatedEntityType(relatedEntityType);
            notification.setRead(false);

            NotificationEntity savedNotification = notificationRepository.save(notification);
            logger.info("Notification created for user {}: {}", user.getUserID(), title);
            return savedNotification;
        } catch (Exception e) {
            logger.error("Error creating notification: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Notify admin about new faculty request
     */
    public void notifyAdminFacultyRequest(UserEntity faculty) {
        try {
            // Get all admin users
            // Note: You may need to create a method in UserRepository to find all admins
            String title = "New Faculty Request";
            String message = faculty.getFname() + " " + faculty.getLname() + " has requested faculty access.";
            
            logger.info("Faculty request notification created for: {}", faculty.getUsername());
        } catch (Exception e) {
            logger.error("Error notifying admin of faculty request: {}", e.getMessage());
        }
    }

    /**
     * Notify faculty about approval/rejection
     */
    public void notifyFacultyApprovalStatus(UserEntity faculty, boolean approved) {
        try {
            String title = approved ? "Faculty Account Approved" : "Faculty Account Rejected";
            String message = approved 
                ? "Your faculty account has been approved. You can now access the faculty dashboard."
                : "Your faculty account request has been rejected.";
            
            createNotification(
                faculty,
                approved ? NotificationType.FACULTY_APPROVED : NotificationType.FACULTY_REJECTED,
                title,
                message
            );
            logger.info("Faculty approval notification sent to: {}", faculty.getUsername());
        } catch (Exception e) {
            logger.error("Error notifying faculty of approval status: {}", e.getMessage());
        }
    }

    /**
     * Notify student about portfolio view
     */
    public void notifyPortfolioView(UserEntity student, UserEntity viewer) {
        try {
            String title = "Your Portfolio Was Viewed";
            String message = viewer.getFname() + " " + viewer.getLname() + " viewed your portfolio.";
            
            createNotification(
                student,
                NotificationType.PORTFOLIO_VIEWED,
                title,
                message,
                viewer.getUserID(),
                null,
                "PORTFOLIO"
            );
            logger.info("Portfolio view notification sent to: {}", student.getUsername());
        } catch (Exception e) {
            logger.error("Error notifying portfolio view: {}", e.getMessage());
        }
    }

    /**
     * Notify teacher about project submission
     */
    public void notifyProjectSubmission(UserEntity teacher, UserEntity student, Long projectId) {
        try {
            String title = "New Project Submission";
            String message = student.getFname() + " " + student.getLname() + " submitted a project.";
            
            createNotification(
                teacher,
                NotificationType.PROJECT_SUBMISSION,
                title,
                message,
                student.getUserID(),
                projectId,
                "PROJECT"
            );
            logger.info("Project submission notification sent to: {}", teacher.getUsername());
        } catch (Exception e) {
            logger.error("Error notifying project submission: {}", e.getMessage());
        }
    }

    /**
     * Notify student about grade posting
     */
    public void notifyGradePosted(UserEntity student, UserEntity teacher, String courseName) {
        try {
            String title = "Grade Posted";
            String message = "Your grade for " + courseName + " has been posted by " + teacher.getFname() + ".";
            
            createNotification(
                student,
                NotificationType.GRADE_POSTED,
                title,
                message,
                teacher.getUserID(),
                null,
                "COURSE"
            );
            logger.info("Grade posted notification sent to: {}", student.getUsername());
        } catch (Exception e) {
            logger.error("Error notifying grade posted: {}", e.getMessage());
        }
    }

    /**
     * Notify student that their project was validated by faculty
     */
    public void notifyProjectValidated(UserEntity student, UserEntity faculty, Long projectId) {
        try {
            String title = "Project Validated";
            String message = faculty.getFname() + " " + faculty.getLname() + " validated your project.";

            createNotification(
                student,
                NotificationType.PROJECT_SUBMISSION,
                title,
                message,
                faculty.getUserID(),
                projectId,
                "PROJECT"
            );
            logger.info("Project validation notification sent to: {}", student.getUsername());
        } catch (Exception e) {
            logger.error("Error notifying project validation: {}", e.getMessage());
        }
    }

    /**
     * Notify student about course enrollment
     */
    public void notifyCourseEnrollment(UserEntity student, String courseName) {
        try {
            String title = "Course Enrollment Confirmed";
            String message = "You have been enrolled in " + courseName + ".";
            
            createNotification(
                student,
                NotificationType.COURSE_ENROLLMENT,
                title,
                message
            );
            logger.info("Course enrollment notification sent to: {}", student.getUsername());
        } catch (Exception e) {
            logger.error("Error notifying course enrollment: {}", e.getMessage());
        }
    }

    /**
     * Send system message to user
     */
    public void sendSystemMessage(UserEntity user, String title, String message) {
        try {
            createNotification(user, NotificationType.SYSTEM_MESSAGE, title, message);
            logger.info("System message sent to: {}", user.getUsername());
        } catch (Exception e) {
            logger.error("Error sending system message: {}", e.getMessage());
        }
    }
}

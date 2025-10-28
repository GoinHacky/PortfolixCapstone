package cit.edu.portfolioX.Controller;

import cit.edu.portfolioX.Entity.NotificationEntity;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Repository.NotificationRepository;
import cit.edu.portfolioX.Repository.UserRepository;
import cit.edu.portfolioX.Security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Notification management APIs")
@CrossOrigin(origins = {"https://portfolixcapstone.netlify.app", "http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class NotificationController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "Get all notifications for user", description = "Retrieves all notifications for the authenticated user")
    @GetMapping
    public ResponseEntity<?> getNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            List<NotificationEntity> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
            long unreadCount = notificationRepository.countUnreadNotifications(user);

            return ResponseEntity.ok(Map.of(
                "notifications", notifications.stream().map(this::mapNotificationToDTO).collect(Collectors.toList()),
                "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            logger.error("Error fetching notifications: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching notifications"));
        }
    }

    @Operation(summary = "Get unread notifications", description = "Retrieves only unread notifications for the authenticated user")
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            List<NotificationEntity> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);

            return ResponseEntity.ok(Map.of(
                "notifications", unreadNotifications.stream().map(this::mapNotificationToDTO).collect(Collectors.toList()),
                "count", unreadNotifications.size()
            ));
        } catch (Exception e) {
            logger.error("Error fetching unread notifications: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching unread notifications"));
        }
    }

    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            long unreadCount = notificationRepository.countUnreadNotifications(user);
            return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
        } catch (Exception e) {
            logger.error("Error getting unread count: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error getting unread count"));
        }
    }

    @Operation(summary = "Mark notification as read", description = "Marks a specific notification as read")
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long notificationId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            NotificationEntity notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));

            if (!notification.getUser().getUserID().equals(user.getUserID())) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access"));
            }

            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            logger.error("Error marking notification as read: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error marking notification as read"));
        }
    }

    @Operation(summary = "Mark all notifications as read", description = "Marks all notifications as read for the authenticated user")
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            List<NotificationEntity> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
            LocalDateTime now = LocalDateTime.now();
            
            for (NotificationEntity notification : unreadNotifications) {
                notification.setRead(true);
                notification.setReadAt(now);
            }
            
            notificationRepository.saveAll(unreadNotifications);

            return ResponseEntity.ok(Map.of("message", "All notifications marked as read", "count", unreadNotifications.size()));
        } catch (Exception e) {
            logger.error("Error marking all notifications as read: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error marking all notifications as read"));
        }
    }

    @Operation(summary = "Delete notification", description = "Deletes a specific notification")
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long notificationId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            NotificationEntity notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));

            if (!notification.getUser().getUserID().equals(user.getUserID())) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access"));
            }

            notificationRepository.delete(notification);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting notification: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting notification"));
        }
    }

    private Map<String, Object> mapNotificationToDTO(NotificationEntity notification) {
        return Map.of(
            "notificationId", notification.getNotificationId(),
            "type", notification.getType().toString(),
            "title", notification.getTitle(),
            "message", notification.getMessage(),
            "isRead", notification.isRead(),
            "relatedUserId", notification.getRelatedUserId() != null ? notification.getRelatedUserId() : "",
            "relatedEntityId", notification.getRelatedEntityId() != null ? notification.getRelatedEntityId() : "",
            "relatedEntityType", notification.getRelatedEntityType() != null ? notification.getRelatedEntityType() : "",
            "createdAt", notification.getCreatedAt(),
            "readAt", notification.getReadAt() != null ? notification.getReadAt() : ""
        );
    }
}

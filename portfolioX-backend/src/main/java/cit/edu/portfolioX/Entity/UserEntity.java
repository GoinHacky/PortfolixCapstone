package cit.edu.portfolioX.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_entity")
public class UserEntity {
    public static enum UserStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userID;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String userEmail;

    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private String fname;
    private String lname;
    private String bio;
    
    @Column(columnDefinition = "TEXT")
    private String profilePic; // Base64 encoded image or URL to stored image
    
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private LocalDateTime lastLogin;
    private boolean firstLogin = true;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.PENDING;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<PortfolioEntity> portfolios;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfileSettingEntity> profileSettings;

    public UserEntity() {
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        // Default to APPROVED for students, PENDING for others
        if (this.role == Role.STUDENT) {
            this.status = UserStatus.APPROVED;
        } else {
            this.status = UserStatus.PENDING;
        }
    }

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
        // Update status if role is set after construction
        if (role == Role.STUDENT) {
            this.status = UserStatus.APPROVED;
        }
    }

    public String getFname() {
        return fname;
    }

    public void setFname(String fname) {
        this.fname = fname;
    }

    public String getLname() {
        return lname;
    }

    public void setLname(String lname) {
        this.lname = lname;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public List<PortfolioEntity> getPortfolios() {
        return portfolios;
    }

    public void setPortfolios(List<PortfolioEntity> portfolios) {
        this.portfolios = portfolios;
    }

    public List<ProfileSettingEntity> getProfileSettings() {
        return profileSettings;
    }

    public void setProfileSettings(List<ProfileSettingEntity> profileSettings) {
        this.profileSettings = profileSettings;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isFirstLogin() {
        return firstLogin;
    }

    public void setFirstLogin(boolean firstLogin) {
        this.firstLogin = firstLogin;
    }

    // Getters and setters...
}

package cit.edu.portfolioX.Entity;

import jakarta.persistence.*;

@Entity
public class ProfileSettingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settingID;

    private String settingKey;
    private String settingValue;

    @ManyToOne
    @JoinColumn(name = "userID")
    private UserEntity user;

    public ProfileSettingEntity() {
    }

    public Long getSettingID() {
        return settingID;
    }

    public void setSettingID(Long settingID) {
        this.settingID = settingID;
    }

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    // Getters and setters...
}

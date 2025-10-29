package cit.edu.portfolioX.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

@Entity
@Table(name = "portfolio_entity")
public class PortfolioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "portfolioid")
    private Long portfolioID;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    @JsonBackReference
    private UserEntity user;

    private String portfolioTitle;
    @Column(columnDefinition = "TEXT")
    private String portfolioDescription;
    private String courseCode;

    private String category; // "project" or "microcredentials"

    // Only for projects
    private String githubLink;

    // Only for microcredentials
    private String certTitle;
    private LocalDate issueDate;
    private String certFile;

    @OneToOne(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private LinkEntity link;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SkillEntity> skills;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CertificationEntity> certifications;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProjectEntity> projects;

    @Column(unique = true)
    private String publicToken;

    @Column(nullable = false)
    private boolean validatedByFaculty = false;
    private String validatedByName;
    private Long validatedById;

    // For microcredentials - witnessed by faculty (comma-separated IDs and names)
    @Column(columnDefinition = "TEXT")
    private String witnessedByIds; // e.g., "1,5,12"
    @Column(columnDefinition = "TEXT")
    private String witnessedByNames; // e.g., "Dr. Smith,Prof. Johnson,Dr. Lee"

    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    public PortfolioEntity(){
        this.publicToken = UUID.randomUUID().toString();
        this.skills = new java.util.ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }// Getters and setters...

    public Long getPortfolioID() {
        return portfolioID;
    }

    public void setPortfolioID(Long portfolioID) {
        this.portfolioID = portfolioID;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public Long getUserID() {
        return user != null ? user.getUserID() : null;
    }

    public String getPortfolioTitle() {
        return portfolioTitle;
    }

    public void setPortfolioTitle(String portfolioTitle) {
        this.portfolioTitle = portfolioTitle;
    }

    public String getPortfolioDescription() {
        return portfolioDescription;
    }

    public void setPortfolioDescription(String portfolioDescription) {
        this.portfolioDescription = portfolioDescription;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getGithubLink() {
        return githubLink;
    }

    public void setGithubLink(String githubLink) {
        this.githubLink = githubLink;
    }

    public String getCertTitle() {
        return certTitle;
    }

    public void setCertTitle(String certTitle) {
        this.certTitle = certTitle;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public String getCertFile() {
        return certFile;
    }

    public void setCertFile(String certFile) {
        this.certFile = certFile;
    }

    public LinkEntity getLink() {
        return link;
    }

    public void setLink(LinkEntity link) {
        this.link = link;
    }

    public List<SkillEntity> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillEntity> skills) {
        this.skills = skills;
    }

    public List<CertificationEntity> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<CertificationEntity> certifications) {
        this.certifications = certifications;
    }

    public List<ProjectEntity> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectEntity> projects) {
        this.projects = projects;
    }

    public String getPublicToken() {
        return publicToken;
    }

    public void setPublicToken(String publicToken) {
        this.publicToken = publicToken;
    }

    public boolean isValidatedByFaculty() {
        return validatedByFaculty;
    }

    public void setValidatedByFaculty(boolean validatedByFaculty) {
        this.validatedByFaculty = validatedByFaculty;
    }

    public String getValidatedByName() {
        return validatedByName;
    }

    public void setValidatedByName(String validatedByName) {
        this.validatedByName = validatedByName;
    }

    public Long getValidatedById() {
        return validatedById;
    }

    public void setValidatedById(Long validatedById) {
        this.validatedById = validatedById;
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

    public String getWitnessedByIds() {
        return witnessedByIds;
    }

    public void setWitnessedByIds(String witnessedByIds) {
        this.witnessedByIds = witnessedByIds;
    }

    public String getWitnessedByNames() {
        return witnessedByNames;
    }

    public void setWitnessedByNames(String witnessedByNames) {
        this.witnessedByNames = witnessedByNames;
    }
}

package cit.edu.portfolioX.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "project_entity")
public class ProjectEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "projectid")
    private Long projectID;

    private String projectName;
    private String projectDetails;
    private LocalDate completionDate;

    @ManyToOne
    @JoinColumn(name = "portfolioid", referencedColumnName = "portfolioid")
    private PortfolioEntity portfolio;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupportingDocumentEntity> supportingDocuments;

    @ManyToOne
    @JoinColumn(name = "userID")
    private UserEntity user;

    public ProjectEntity() {
        
    }

    public Long getProjectID() {
        return projectID;
    }

    public void setProjectID(Long projectID) {
        this.projectID = projectID;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectDetails() {
        return projectDetails;
    }

    public void setProjectDetails(String projectDetails) {
        this.projectDetails = projectDetails;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public PortfolioEntity getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(PortfolioEntity portfolio) {
        this.portfolio = portfolio;
    }

    public List<SupportingDocumentEntity> getSupportingDocuments() {
        return supportingDocuments;
    }

    public void setSupportingDocuments(List<SupportingDocumentEntity> supportingDocuments) {
        this.supportingDocuments = supportingDocuments;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    // Getters and setters...
}

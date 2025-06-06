package cit.edu.portfolioX.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
public class ProjectEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectID;

    private String projectName;
    private String projectDetails;
    private LocalDate completionDate;

    @ManyToOne
    @JoinColumn(name = "portfolioID")
    private PortfolioEntity portfolio;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupportingDocumentEntity> supportingDocuments;

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

    // Getters and setters...
}

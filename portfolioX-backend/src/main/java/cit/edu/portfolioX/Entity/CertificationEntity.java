package cit.edu.portfolioX.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class CertificationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long certID;

    private String certTitle;
    private String issuedBy;
    private LocalDate issueDate;

    @ManyToOne
    @JoinColumn(name = "portfolioID")
    private PortfolioEntity portfolio;

    public CertificationEntity() {
        
    }

    public Long getCertID() {
        return certID;
    }

    public void setCertID(Long certID) {
        this.certID = certID;
    }

    public String getCertTitle() {
        return certTitle;
    }

    public void setCertTitle(String certTitle) {
        this.certTitle = certTitle;
    }

    public String getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(String issuedBy) {
        this.issuedBy = issuedBy;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public PortfolioEntity getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(PortfolioEntity portfolio) {
        this.portfolio = portfolio;
    }

    // Getters and setters...
}

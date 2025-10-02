package cit.edu.portfolioX.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "link_entity")
public class LinkEntity {
    @Id
    @Column(name = "portfolioid")
    private Long portfolioID;

    @OneToOne
    @MapsId
    @JoinColumn(name = "portfolioid", referencedColumnName = "portfolioid")
    @JsonBackReference
    private PortfolioEntity portfolio;

    private String link;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public LinkEntity() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(30);
    }
    
    public Long getPortfolioID() {
        return portfolioID;
    }
    public void setPortfolioID(Long portfolioID) {
        this.portfolioID = portfolioID;
    }
    public PortfolioEntity getPortfolio() {
        return portfolio;
    }
    public void setPortfolio(PortfolioEntity portfolio) {
        this.portfolio = portfolio;
    }
    public String getLink() {
        return link;
    }
    public void setLink(String link) {
        this.link = link;
    }
    public boolean isActive() {
        return isActive;
    }
    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    // Getters and setters...
}

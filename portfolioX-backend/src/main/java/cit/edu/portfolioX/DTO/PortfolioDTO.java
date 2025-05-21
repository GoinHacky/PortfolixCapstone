
package cit.edu.portfolioX.DTO;

public class PortfolioDTO {
    private Long userID;
    private String portfolioTitle;
    private String githubLink;

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getPortfolioTitle() { return portfolioTitle; }
    public void setPortfolioTitle(String portfolioTitle) { this.portfolioTitle = portfolioTitle; }

    public String getGithubLink() { return githubLink; }
    public void setGithubLink(String githubLink) { this.githubLink = githubLink; }
}

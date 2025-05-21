
package cit.edu.portfolioX.DTO;

public class UserDTO {
    private Long userID;
    private String username;
    private String email;
    private String fname;
    private String lname;
    private String role;

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFname() { return fname; }
    public void setFname(String fname) { this.fname = fname; }

    public String getLname() { return lname; }
    public void setLname(String lname) { this.lname = lname; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

package cit.edu.portfolioX.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login Request")
public class LoginRequestDTO {
    
    @Schema(description = "Username", example = "johndoe")
    @NotBlank(message = "Username is required")
    private String username;

    @Schema(description = "Password", example = "password123")
    @NotBlank(message = "Password is required")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

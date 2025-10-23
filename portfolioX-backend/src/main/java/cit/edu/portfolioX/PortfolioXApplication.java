package cit.edu.portfolioX;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import cit.edu.portfolioX.Entity.Role;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Entity.UserEntity.UserStatus;
import cit.edu.portfolioX.Repository.UserRepository;

@SpringBootApplication(scanBasePackages = "cit.edu.portfolioX")
@EntityScan(basePackages = "cit.edu.portfolioX.Entity")
@EnableJpaRepositories(basePackages = "cit.edu.portfolioX.Repository")
public class PortfolioXApplication {

	public static void main(String[] args) {
		SpringApplication.run(PortfolioXApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedAdmin(UserRepository userRepository) {
		return args -> {
			if (userRepository.findByRole(Role.ADMIN).isEmpty()) {
				UserEntity admin = new UserEntity();
				admin.setUsername("admin");
				admin.setUserEmail("admin@portfolix.com");
				admin.setPassword(new BCryptPasswordEncoder().encode("admin123"));
				admin.setRole(Role.ADMIN);
				admin.setFname("Admin");
				admin.setLname("User");
				admin.setStatus(UserStatus.APPROVED);
				userRepository.save(admin);
			}
		};
	}
}

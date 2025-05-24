package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cit.edu.portfolioX.Entity.UserEntity;
import cit.edu.portfolioX.Entity.Role;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    UserEntity findByUsername(String username);
    UserEntity findByUserEmail(String userEmail);
    List<UserEntity> findByRole(Role role);

    @Query("SELECT u FROM UserEntity u WHERE u.role = :role AND " +
           "(LOWER(u.fname) LIKE %:q% OR LOWER(u.lname) LIKE %:q% OR LOWER(u.userEmail) LIKE %:q%)")
    List<UserEntity> findByRoleAndSearch(@Param("role") cit.edu.portfolioX.Entity.Role role, @Param("q") String q);
}

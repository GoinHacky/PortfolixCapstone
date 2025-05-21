
package cit.edu.portfolioX.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cit.edu.portfolioX.Entity.ProfileSettingEntity;

@Repository
public interface ProfileSettingRepository extends JpaRepository<ProfileSettingEntity, Long> {}

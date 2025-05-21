
package cit.edu.portfolioX.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import cit.edu.portfolioX.Entity.ProfileSettingEntity;
import cit.edu.portfolioX.Repository.ProfileSettingRepository;

@Service
public class ProfileSettingService {
    @Autowired
    private ProfileSettingRepository settingRepository;

    public List<ProfileSettingEntity> getAll() {
        return settingRepository.findAll();
    }

    public Optional<ProfileSettingEntity> getById(Long id) {
        return settingRepository.findById(id);
    }

    public ProfileSettingEntity save(ProfileSettingEntity setting) {
        return settingRepository.save(setting);
    }

    public void delete(Long id) {
        settingRepository.deleteById(id);
    }
}

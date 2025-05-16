package com.portfoliox.repository;

import com.portfoliox.model.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ShareRepository extends JpaRepository<Share, Long> {
    List<Share> findByPortfolioId(Long portfolioId);
    List<Share> findByInvitedEmail(String email);
    List<Share> findByPortfolioIdAndShareType(Long portfolioId, Share.ShareType shareType);
    Optional<Share> findByShareUrl(String shareUrl);
} 
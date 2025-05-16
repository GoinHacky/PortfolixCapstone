package com.portfoliox.repository;

import com.portfoliox.model.Portfolio;
import com.portfoliox.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUser(User user);
    List<Portfolio> findByUserId(Long userId);
    List<Portfolio> findByCategory(String category);
} 
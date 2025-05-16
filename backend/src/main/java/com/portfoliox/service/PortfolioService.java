package com.portfoliox.service;

import com.portfoliox.model.Portfolio;
import com.portfoliox.model.User;
import com.portfoliox.repository.PortfolioRepository;
import com.portfoliox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    @Transactional
    public Portfolio createPortfolio(Portfolio portfolio, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        portfolio.setUser(user);
        return portfolioRepository.save(portfolio);
    }

    public List<Portfolio> getPortfoliosByUserId(Long userId) {
        return portfolioRepository.findByUserId(userId);
    }

    public Portfolio getPortfolioById(Long id) {
        return portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
    }

    @Transactional
    public Portfolio updatePortfolio(Long id, Portfolio updatedPortfolio) {
        Portfolio existingPortfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        
        existingPortfolio.setTitle(updatedPortfolio.getTitle());
        existingPortfolio.setDescription(updatedPortfolio.getDescription());
        existingPortfolio.setCategory(updatedPortfolio.getCategory());
        
        return portfolioRepository.save(existingPortfolio);
    }

    @Transactional
    public void deletePortfolio(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        
        portfolioRepository.delete(portfolio);
    }
} 
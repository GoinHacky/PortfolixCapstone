package com.portfoliox.repository;

import com.portfoliox.model.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    List<Analytics> findByPortfolioId(Long portfolioId);
    List<Analytics> findByItemId(Long itemId);
    List<Analytics> findByPortfolioIdAndEventType(Long portfolioId, Analytics.EventType eventType);
    
    @Query("SELECT COUNT(a) FROM Analytics a WHERE a.portfolio.id = :portfolioId AND a.eventType = :eventType")
    Long countByPortfolioIdAndEventType(@Param("portfolioId") Long portfolioId, @Param("eventType") Analytics.EventType eventType);
    
    @Query("SELECT COUNT(a) FROM Analytics a WHERE a.item.id = :itemId AND a.eventType = :eventType")
    Long countByItemIdAndEventType(@Param("itemId") Long itemId, @Param("eventType") Analytics.EventType eventType);
} 
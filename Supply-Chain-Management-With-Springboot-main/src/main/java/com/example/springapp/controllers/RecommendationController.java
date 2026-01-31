package com.example.springapp.controllers;

import com.example.springapp.models.StockRecommendation;
import com.example.springapp.service.RecommendationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RecommendationController {

    @Autowired
    RecommendationService recommendationService;

    @GetMapping
    public List<StockRecommendation> getAllRecommendations() {
        return recommendationService.getStockRecommendations();
    }

    @GetMapping("/{productId}")
    public StockRecommendation getRecommendationForProduct(@PathVariable Long productId) {
        return recommendationService.getRecommendationForProduct(productId);
    }

    @GetMapping("/alerts")
    public List<StockRecommendation> getCriticalAlerts() {
        return recommendationService.getCriticalAlerts();
    }

    @GetMapping("/threshold/{percent}")
    public List<StockRecommendation> getAlertsWithThreshold(@PathVariable double percent) {
        // Convert percent from 0-100 to 0-1
        double threshold = percent / 100.0;
        return recommendationService.getLowStockAlerts(threshold);
    }
}

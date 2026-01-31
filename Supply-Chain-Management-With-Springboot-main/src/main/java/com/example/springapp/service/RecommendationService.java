package com.example.springapp.service;

import com.example.springapp.models.Inventory;
import com.example.springapp.models.Product;
import com.example.springapp.models.StockRecommendation;
import com.example.springapp.models.StockTransaction;
import com.example.springapp.repositories.InventoryRepository;
import com.example.springapp.repositories.ProductRepository;
import com.example.springapp.repositories.StockTransactionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

    @Autowired
    InventoryRepository inventoryRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    StockTransactionRepository stockTransactionRepository;

    // Default threshold: alert when stock is at 20% of reorder level or below
    private static final double DEFAULT_THRESHOLD_PERCENT = 0.20;

    /**
     * Get all stock recommendations based on default threshold (20%)
     */
    public List<StockRecommendation> getStockRecommendations() {
        return getLowStockAlerts(DEFAULT_THRESHOLD_PERCENT);
    }

    /**
     * Get stock recommendation for a specific product
     */
    public StockRecommendation getRecommendationForProduct(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId).orElse(null);
        if (inventory == null) {
            return null;
        }

        // Check if stock is below reorder level
        if (inventory.getCurrentStock() >= inventory.getReorderLevel()) {
            return null; // No recommendation needed
        }

        return createRecommendation(inventory);
    }

    /**
     * Get low stock alerts with custom threshold percentage
     * @param thresholdPercent - Alert when currentStock < (reorderLevel * thresholdPercent)
     *                          e.g., 0.20 means alert at 20% of reorder level
     */
    public List<StockRecommendation> getLowStockAlerts(double thresholdPercent) {
        List<Inventory> allInventory = inventoryRepository.findAll();
        List<StockRecommendation> recommendations = new ArrayList<>();

        for (Inventory inventory : allInventory) {
            int threshold = (int) (inventory.getReorderLevel() * thresholdPercent);
            if (inventory.getCurrentStock() <= threshold) {
                recommendations.add(createRecommendation(inventory));
            }
        }

        return recommendations;
    }

    /**
     * Get critical stock alerts (below 10% of reorder level)
     */
    public List<StockRecommendation> getCriticalAlerts() {
        return getLowStockAlerts(0.10);
    }

    /**
     * Create a stock recommendation for an inventory item
     */
    private StockRecommendation createRecommendation(Inventory inventory) {
        StockRecommendation recommendation = new StockRecommendation();

        // Basic inventory info
        recommendation.setProductId(inventory.getProductId());
        recommendation.setProductName(inventory.getProductName());
        recommendation.setCurrentStock(inventory.getCurrentStock());
        recommendation.setReorderLevel(inventory.getReorderLevel());

        // Calculate recommended quantity (bring stock to max capacity)
        int recommendedQty = calculateRecommendedQuantity(inventory);
        recommendation.setRecommendedQuantity(recommendedQty);

        // Determine urgency level
        String urgency = getUrgencyLevel(inventory.getCurrentStock(), inventory.getReorderLevel());
        recommendation.setUrgencyLevel(urgency);

        // Estimate days until stockout
        int daysUntilStockout = estimateDaysUntilStockout(inventory);
        recommendation.setDaysUntilStockout(daysUntilStockout);
        
        // Calculate and set daily sales rate for transparency
        double dailySalesRate = calculateDailySalesRate(inventory.getProductId());
        recommendation.setDailySalesRate(dailySalesRate);

        // Get product to find supplier info
        Product product = productRepository.findById(inventory.getProductId()).orElse(null);
        if (product != null) {
            recommendation.setSupplierId(product.getSupplierId());
            recommendation.setSupplierName(product.getSupplierName());
        }

        return recommendation;
    }

    /**
     * Calculate recommended reorder quantity
     * Brings stock from current level to max capacity
     */
    private int calculateRecommendedQuantity(Inventory inventory) {
        return inventory.getMaxCapacity() - inventory.getCurrentStock();
    }

    /**
     * Determine urgency level based on current stock vs reorder level
     * CRITICAL: < 10% of reorder level
     * HIGH: 10-20% of reorder level
     * MEDIUM: 20-30% of reorder level
     */
    private String getUrgencyLevel(int currentStock, int reorderLevel) {
        double percentOfReorder = (double) currentStock / reorderLevel;

        if (percentOfReorder < 0.10) {
            return "CRITICAL";
        } else if (percentOfReorder < 0.20) {
            return "HIGH";
        } else {
            return "MEDIUM";
        }
    }

    /**
     * Estimate days until stockout based on average daily sales
     * Simple formula: remaining_days = current_stock / daily_sales_rate
     * Calculated from transaction history over last 30 days
     */
    private int estimateDaysUntilStockout(Inventory inventory) {
        // Prioritize manual input from Inventory entity if available
        double dailySalesRate = 0.0;
        
        if (inventory.getAverageDailyConsumption() != null && inventory.getAverageDailyConsumption() > 0) {
            dailySalesRate = inventory.getAverageDailyConsumption();
        } else {
            // Fallback to calculated rate from transactions
            dailySalesRate = calculateDailySalesRate(inventory.getProductId());
        }
        
        if (dailySalesRate == 0) {
            return 999; // No sales history, stock will last indefinitely
        }
        
        // Simple formula: days remaining = current stock / daily sales rate
        int daysRemaining = (int) Math.ceil(inventory.getCurrentStock() / dailySalesRate);
        return Math.max(0, daysRemaining);
    }
    
    /**
     * Calculate average daily sales rate for a product
     * Formula: total_items_sold_last_30_days / 30
     */
    private double calculateDailySalesRate(Long productId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        List<StockTransaction> recentSales = stockTransactionRepository
                .findByProductIdAndTransactionType(productId, "SALE");
        
        // Sum total sold in last 30 days
        int totalSold = 0;
        for (StockTransaction transaction : recentSales) {
            if (transaction.getTransactionDate().isAfter(thirtyDaysAgo)) {
                totalSold += Math.abs(transaction.getQuantity());
            }
        }
        
        // Daily sales rate = total sold / 30 days
        return totalSold / 30.0;
    }
}

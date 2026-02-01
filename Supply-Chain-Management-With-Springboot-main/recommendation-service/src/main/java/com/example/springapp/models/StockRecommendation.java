package com.example.springapp.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockRecommendation {
    private Long productId;
    private String productName;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer recommendedQuantity;
    private String urgencyLevel; // CRITICAL, HIGH, MEDIUM
    private String supplierId;
    private String supplierName;
    private Integer daysUntilStockout;
    private Double dailySalesRate;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public Integer getRecommendedQuantity() {
        return recommendedQuantity;
    }

    public void setRecommendedQuantity(Integer recommendedQuantity) {
        this.recommendedQuantity = recommendedQuantity;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public String getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(String supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public Integer getDaysUntilStockout() {
        return daysUntilStockout;
    }

    public void setDaysUntilStockout(Integer daysUntilStockout) {
        this.daysUntilStockout = daysUntilStockout;
    }

    public Double getDailySalesRate() {
        return dailySalesRate;
    }

    public void setDailySalesRate(Double dailySalesRate) {
        this.dailySalesRate = dailySalesRate;
    }
}

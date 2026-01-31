package com.example.springapp.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockRecommendation {

    private Long productId;
    private String productName;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer recommendedQuantity;
    private String urgencyLevel; // CRITICAL, HIGH, MEDIUM
    private Integer daysUntilStockout;
    private Double dailySalesRate; // Average items sold per day
    private String supplierId;
    private String supplierName;
}

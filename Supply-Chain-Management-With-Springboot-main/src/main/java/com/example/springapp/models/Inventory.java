package com.example.springapp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "product_id", nullable = false, unique = true)
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "last_restocked")
    private LocalDateTime lastRestocked;

    @Column(name = "location")
    private String location;

    @Column(name = "average_daily_consumption")
    private Double averageDailyConsumption;

    @PrePersist
    protected void onCreate() {
        if (lastRestocked == null) {
            lastRestocked = LocalDateTime.now();
        }
    }
}

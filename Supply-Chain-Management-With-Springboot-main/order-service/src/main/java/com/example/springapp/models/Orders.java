package com.example.springapp.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;


    @Column(name = "customerid")
    private String customerid;

    @Column(name = "producerid")
    private String producerid;

    @Column(name = "deliveryboyid")
    private String deliveryboyid;

    @Column(name = "status")
    private String status;

    @Column(name = "order_date")
    private java.time.LocalDateTime orderDate;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "notes", length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (orderDate == null) {
            orderDate = java.time.LocalDateTime.now();
        }
    }

    @jakarta.persistence.Transient
    private java.util.List<OrderItem> items;
}
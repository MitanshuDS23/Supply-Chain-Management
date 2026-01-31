package com.example.springapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.models.OrderItem;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Integer orderId);
    List<OrderItem> findByProductId(Long productId);
}

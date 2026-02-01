package com.example.springapp.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.models.Orders;

public interface OrdersRepo extends JpaRepository<Orders, Integer> {
    Page<Orders> findByStatus(String status, Pageable pageable);
}
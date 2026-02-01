package com.example.springapp.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.models.StockTransaction;

import java.time.LocalDateTime;
import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    Page<StockTransaction> findByProductIdOrderByTransactionDateDesc(Long productId, Pageable pageable);
    List<StockTransaction> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);
    List<StockTransaction> findByProductIdAndTransactionType(Long productId, String transactionType);
}

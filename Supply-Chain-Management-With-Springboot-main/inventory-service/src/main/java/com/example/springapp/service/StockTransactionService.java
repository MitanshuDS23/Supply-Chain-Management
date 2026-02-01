package com.example.springapp.service;

import com.example.springapp.models.StockTransaction;
import com.example.springapp.repositories.StockTransactionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockTransactionService {

    @Autowired
    StockTransactionRepository stockTransactionRepository;

    public String recordTransaction(StockTransaction transaction) {
        stockTransactionRepository.save(transaction);
        return "Transaction recorded successfully";
    }

    public List<StockTransaction> getTransactionHistory(Long productId, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return stockTransactionRepository.findByProductIdOrderByTransactionDateDesc(productId, paging).getContent();
    }

    public List<StockTransaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return stockTransactionRepository.findByTransactionDateBetween(start, end);
    }

    public List<StockTransaction> getTransactionsByProductAndType(Long productId, String type) {
        return stockTransactionRepository.findByProductIdAndTransactionType(productId, type);
    }
}

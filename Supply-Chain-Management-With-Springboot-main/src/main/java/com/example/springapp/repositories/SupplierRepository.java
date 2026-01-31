package com.example.springapp.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.models.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
    Page<Supplier> findByRatingGreaterThanEqual(Double rating, Pageable pageable);
}

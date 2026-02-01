package com.example.springapp.service;

import com.example.springapp.models.Supplier;
import com.example.springapp.repositories.SupplierRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    SupplierRepository supplierRepository;

    public String addSupplier(Supplier supplier) {
        supplierRepository.save(supplier);
        return "Supplier added successfully with ID: " + supplier.getId();
    }

    public String updateSupplier(String id, Supplier supplier) {
        Supplier existingSupplier = supplierRepository.findById(id).orElse(null);
        if (existingSupplier == null) {
            return "Supplier not found";
        }
        supplier.setId(id);
        supplierRepository.saveAndFlush(supplier);
        return "Supplier updated successfully";
    }

    public String deleteSupplier(String id) {
        try {
            supplierRepository.deleteById(id);
        } catch (Exception e) {
            return "Supplier not found or cannot be deleted";
        }
        return "Supplier deleted successfully";
    }

    public Supplier getSupplierById(String id) {
        Supplier supplier = supplierRepository.findById(id).orElse(null);
        if (supplier == null) {
            supplier = new Supplier();
            supplier.setId("-1");
            supplier.setName("Supplier not found");
        }
        return supplier;
    }

    public List<Supplier> getAllSuppliers(int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return supplierRepository.findAll(paging).getContent();
    }

    public String updateSupplierRating(String id, Double rating) {
        Supplier supplier = supplierRepository.findById(id).orElse(null);
        if (supplier == null) {
            return "Supplier not found";
        }
        if (rating < 0 || rating > 5) {
            return "Rating must be between 0 and 5";
        }
        supplier.setRating(rating);
        supplierRepository.saveAndFlush(supplier);
        return "Supplier rating updated to: " + rating;
    }

    public List<Supplier> getTopRatedSuppliers(Double minRating, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return supplierRepository.findByRatingGreaterThanEqual(minRating, paging).getContent();
    }
}

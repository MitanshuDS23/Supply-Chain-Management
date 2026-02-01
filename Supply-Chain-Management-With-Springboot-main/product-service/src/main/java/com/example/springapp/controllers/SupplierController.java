package com.example.springapp.controllers;

import com.example.springapp.models.Supplier;
import com.example.springapp.service.SupplierService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suppliers")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class SupplierController {

    private static final Logger logger = LoggerFactory.getLogger(SupplierController.class);

    @Autowired
    SupplierService supplierService;

    @PostMapping
    public ResponseEntity<?> addSupplier(@RequestBody Supplier supplier) {
        try {
            if (supplier == null || supplier.getName() == null || supplier.getName().trim().isEmpty()) {
                logger.warn("Attempt to add supplier with invalid data");
                return buildErrorResponse("Supplier name is required", HttpStatus.BAD_REQUEST);
            }

            String result = supplierService.addSupplier(supplier);
            logger.info("Added supplier: {}", supplier.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            response.put("supplier", supplier);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Error adding supplier", e);
            return buildErrorResponse("Failed to add supplier: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable String id, @RequestBody Supplier supplier) {
        try {
            String result = supplierService.updateSupplier(id, supplier);
            logger.info("Updated supplier: {}", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error updating supplier: {}", id, e);
            return buildErrorResponse("Failed to update supplier", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable String id) {
        try {
            String result = supplierService.deleteSupplier(id);
            logger.info("Deleted supplier: {}", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error deleting supplier: {}", id, e);
            return buildErrorResponse("Failed to delete supplier", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierById(@PathVariable String id) {
        try {
            Supplier supplier = supplierService.getSupplierById(id);
            
            if (supplier == null) {
                return buildErrorResponse("Supplier not found", HttpStatus.NOT_FOUND);
            }
            
            return ResponseEntity.ok(supplier);
            
        } catch (Exception e) {
            logger.error("Error retrieving supplier: {}", id, e);
            return buildErrorResponse("Failed to retrieve supplier", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllSuppliers(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            List<Supplier> suppliers = supplierService.getAllSuppliers(pageNo, pageSize);
            logger.info("Retrieved {} suppliers", suppliers.size());
            return ResponseEntity.ok(suppliers);
            
        } catch (Exception e) {
            logger.error("Error retrieving suppliers", e);
            return buildErrorResponse("Failed to retrieve suppliers", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/rating")
    public ResponseEntity<?> updateRating(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        try {
            Double rating = Double.parseDouble(request.get("rating").toString());
            String result = supplierService.updateSupplierRating(id, rating);
            logger.info("Updated rating for supplier: {}", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error updating supplier rating: {}", id, e);
            return buildErrorResponse("Failed to update rating", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRatedSuppliers(
            @RequestParam(defaultValue = "4.0") Double minRating,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            List<Supplier> suppliers = supplierService.getTopRatedSuppliers(minRating, pageNo, pageSize);
            logger.info("Retrieved {} top-rated suppliers", suppliers.size());
            return ResponseEntity.ok(suppliers);
            
        } catch (Exception e) {
            logger.error("Error retrieving top-rated suppliers", e);
            return buildErrorResponse("Failed to retrieve suppliers", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<?> buildErrorResponse(String message, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}

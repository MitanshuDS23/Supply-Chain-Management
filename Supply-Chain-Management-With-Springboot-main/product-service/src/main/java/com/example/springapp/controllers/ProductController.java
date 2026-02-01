package com.example.springapp.controllers;

import com.example.springapp.models.Product;
import com.example.springapp.service.ProductService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    ProductService productService;

    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        try {
            if (product == null || product.getName() == null || product.getName().trim().isEmpty()) {
                logger.warn("Attempt to add product with invalid data");
                return buildErrorResponse("Product name is required", HttpStatus.BAD_REQUEST);
            }

            String result = productService.addProduct(product);
            logger.info("Added product: {}", product.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            response.put("product", product);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid product data: {}", e.getMessage());
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error adding product", e);
            return buildErrorResponse("Failed to add product: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            String result = productService.updateProduct(id, product);
            logger.info("Updated product: {}", id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error updating product: {}", id, e);
            return buildErrorResponse("Failed to update product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            String result = productService.deleteProduct(id);
            logger.info("Deleted product: {}", id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error deleting product: {}", id, e);
            return buildErrorResponse("Failed to delete product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);

            if (product == null) {
                return buildErrorResponse("Product not found", HttpStatus.NOT_FOUND);
            }

            return ResponseEntity.ok(product);

        } catch (Exception e) {
            logger.error("Error retrieving product: {}", id, e);
            return buildErrorResponse("Failed to retrieve product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            Page<Product> products = productService.getAllProducts(pageNo, pageSize);
            logger.info("Retrieved {} products", products.getTotalElements());
            return ResponseEntity.ok(products);

        } catch (Exception e) {
            logger.error("Error retrieving products", e);
            return buildErrorResponse("Failed to retrieve products", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            List<Product> products = productService.getProductsByCategory(category, pageNo, pageSize);
            logger.info("Retrieved {} products in category: {}", products.size(), category);
            return ResponseEntity.ok(products);

        } catch (Exception e) {
            logger.error("Error retrieving products by category: {}", category, e);
            return buildErrorResponse("Failed to retrieve products", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<?> getProductsBySupplier(
            @PathVariable String supplierId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            List<Product> products = productService.getProductsBySupplier(supplierId, pageNo, pageSize);
            logger.info("Retrieved {} products for supplier: {}", products.size(), supplierId);
            return ResponseEntity.ok(products);

        } catch (Exception e) {
            logger.error("Error retrieving products by supplier: {}", supplierId, e);
            return buildErrorResponse("Failed to retrieve products", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            List<Product> products = productService.searchProducts(keyword, pageNo, pageSize);
            logger.info("Found {} products matching: {}", products.size(), keyword);
            return ResponseEntity.ok(products);

        } catch (Exception e) {
            logger.error("Error searching products with keyword: {}", keyword, e);
            return buildErrorResponse("Failed to search products", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<?> buildErrorResponse(String message, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}

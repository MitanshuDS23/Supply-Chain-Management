package com.example.springapp.service;

import com.example.springapp.events.ProductEvent;
import com.example.springapp.events.ProductEventPublisher;
import com.example.springapp.models.Product;
import com.example.springapp.repositories.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    com.example.springapp.client.InventoryClient inventoryClient;

    @Autowired
    ProductEventPublisher productEventPublisher;

    @CacheEvict(value = "products", allEntries = true)

    public String addProduct(Product product) {
        if (productRepository.existsByBarcode(product.getBarcode())) {
            throw new IllegalArgumentException("Product with barcode " + product.getBarcode() + " already exists");
        }
        Product savedProduct = productRepository.save(product);
        // Sync with Inventory - Create initial inventory record
        try {
            inventoryClient.createInventoryFromProduct(savedProduct.getId(), savedProduct.getName(),
                    product.getQuantity());
        } catch (Exception e) {
            // Log error but don't fail product creation? Or fail?
            // For now, logging.
            System.err.println("Failed to create inventory: " + e.getMessage());
        }

        // Publish product created event
        ProductEvent event = new ProductEvent(
                ProductEvent.EventType.CREATED,
                savedProduct.getId(),
                savedProduct.getName(),
                savedProduct.getCategory(),
                savedProduct.getPrice(),
                LocalDateTime.now());
        productEventPublisher.publishProductEvent(event);

        return "Product added successfully with ID: " + savedProduct.getId();
    }

    @CacheEvict(value = { "product", "products" }, allEntries = true)

    public String updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct == null) {
            return "Product not found";
        }
        product.setId(id);
        product.setCreatedDate(existingProduct.getCreatedDate());
        Product updatedProduct = productRepository.saveAndFlush(product);

        // Publish product updated event
        ProductEvent event = new ProductEvent(
                ProductEvent.EventType.UPDATED,
                updatedProduct.getId(),
                updatedProduct.getName(),
                updatedProduct.getCategory(),
                updatedProduct.getPrice(),
                LocalDateTime.now());
        productEventPublisher.publishProductEvent(event);

        return "Product updated successfully";
    }

    @CacheEvict(value = { "product", "products" }, allEntries = true)

    public String deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return "Product not found or cannot be deleted";
        }

        try {
            productRepository.deleteById(id);

            // Publish product deleted event
            ProductEvent event = new ProductEvent(
                    ProductEvent.EventType.DELETED,
                    id,
                    product.getName(),
                    product.getCategory(),
                    product.getPrice(),
                    LocalDateTime.now());
            productEventPublisher.publishProductEvent(event);
        } catch (Exception e) {
            return "Product not found or cannot be deleted";
        }
        return "Product deleted successfully";
    }

    @Cacheable(value = "product", key = "#id")

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            product = new Product();
            product.setId(-1L);
            product.setName("Product not found");
        }
        return product;
    }

    @Cacheable(value = "products")

    public Page<Product> getAllProducts(int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return productRepository.findAll(paging);
    }

    public List<Product> getProductsByCategory(String category, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return productRepository.findByCategory(category, paging).getContent();
    }

    public List<Product> searchProducts(String keyword, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return productRepository.findByNameContainingIgnoreCase(keyword, paging).getContent();
    }

    public List<Product> getProductsBySupplier(String supplierId, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return productRepository.findBySupplierIdOrderByName(supplierId, paging).getContent();
    }
}

package com.example.springapp.service;

import com.example.springapp.models.Product;
import com.example.springapp.repositories.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    InventoryService inventoryService;

    public String addProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        // Sync with Inventory - Create initial inventory record
        inventoryService.createInventoryFromProduct(savedProduct.getId(), savedProduct.getName(), product.getQuantity());
        return "Product added successfully with ID: " + savedProduct.getId();
    }

    public String updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct == null) {
            return "Product not found";
        }
        product.setId(id);
        product.setCreatedDate(existingProduct.getCreatedDate());
        productRepository.saveAndFlush(product);
        return "Product updated successfully";
    }

    public String deleteProduct(Long id) {
        try {
            productRepository.deleteById(id);
        } catch (Exception e) {
            return "Product not found or cannot be deleted";
        }
        return "Product deleted successfully";
    }

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            product = new Product();
            product.setId(-1L);
            product.setName("Product not found");
        }
        return product;
    }

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

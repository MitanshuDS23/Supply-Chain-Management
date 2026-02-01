package com.example.springapp.service;

import com.example.springapp.models.Inventory;
// import com.example.springapp.models.Product; // Removed
import com.example.springapp.models.StockTransaction;
import com.example.springapp.repositories.InventoryRepository;
// import com.example.springapp.repositories.ProductRepository; // Removed
import com.example.springapp.client.ProductClient;
import com.example.springapp.dto.ProductDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    InventoryRepository inventoryRepository;

    @Autowired
    ProductClient productClient;

    @Autowired
    StockTransactionService stockTransactionService;

    public String createInventoryForProduct(Long productId, int reorderLevel, int maxCapacity, String location) {
        ProductDTO product;
        try {
            product = productClient.getProductById(productId);
        } catch (Exception e) {
            return "Product not found (Service unavailable or invalid ID)";
        }

        if (product == null) {
            return "Product not found";
        }

        if (inventoryRepository.findByProductId(productId).isPresent()) {
            return "Inventory already exists for this product";
        }

        Inventory inventory = new Inventory();
        inventory.setProductId(productId);
        inventory.setProductName(product.getName());
        inventory.setCurrentStock(0);
        inventory.setReorderLevel(reorderLevel);
        inventory.setMaxCapacity(maxCapacity);
        inventory.setLocation(location);
        inventoryRepository.save(inventory);

        return "Inventory created successfully for product: " + product.getName();
    }

    @Transactional
    public String updateStock(Long productId, int quantity, String type, String performedBy, String notes) {
        Inventory inventory = inventoryRepository.findByProductId(productId).orElse(null);
        if (inventory == null) {
            return "Inventory not found for this product";
        }

        int previousStock = inventory.getCurrentStock();
        int newStock = previousStock + quantity;

        if (newStock < 0) {
            return "Insufficient stock. Current stock: " + previousStock;
        }

        if (newStock > inventory.getMaxCapacity()) {
            return "Exceeds maximum capacity. Max capacity: " + inventory.getMaxCapacity();
        }

        inventory.setCurrentStock(newStock);
        if (quantity > 0 && "RESTOCK".equals(type)) {
            inventory.setLastRestocked(LocalDateTime.now());
        }
        inventoryRepository.saveAndFlush(inventory);

        // Record transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setProductId(productId);
        transaction.setTransactionType(type);
        transaction.setQuantity(quantity);
        transaction.setPreviousStock(previousStock);
        transaction.setNewStock(newStock);
        transaction.setPerformedBy(performedBy);
        transaction.setNotes(notes);
        stockTransactionService.recordTransaction(transaction);

        return "Stock updated successfully. New stock: " + newStock;
    }

    public String restockProduct(Long productId, int quantity, String performedBy) {
        return updateStock(productId, quantity, "RESTOCK", performedBy, "Product restocked");
    }

    public String reduceStock(Long productId, int quantity, String performedBy) {
        return updateStock(productId, -quantity, "SALE", performedBy, "Stock reduced for sale");
    }

    public Inventory getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId).orElse(null);
    }

    public List<Inventory> getAllInventory(int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize);
        return inventoryRepository.findAll(paging).getContent();
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public String updateReorderLevel(Long productId, int newReorderLevel) {
        Inventory inventory = inventoryRepository.findByProductId(productId).orElse(null);
        if (inventory == null) {
            return "Inventory not found";
        }
        inventory.setReorderLevel(newReorderLevel);
        inventoryRepository.saveAndFlush(inventory);
        return "Reorder level updated to: " + newReorderLevel;
    }

    public String createInventoryFromProduct(Long productId, String productName, Integer initialStock) {
        if (inventoryRepository.findByProductId(productId).isPresent()) {
            return "Inventory already exists";
        }

        Inventory inventory = new Inventory();
        inventory.setProductId(productId);
        inventory.setProductName(productName);
        inventory.setCurrentStock(initialStock != null ? initialStock : 0);
        inventory.setReorderLevel(10); // Default value
        inventory.setMaxCapacity(100); // Default value
        inventory.setLocation("Warehouse A"); // Default value
        inventory.setAverageDailyConsumption(0.0);
        inventoryRepository.save(inventory);

        return "Inventory created successfully";
    }

    public String updateAverageDailyConsumption(Long productId, Double consumption) {
        Inventory inventory = inventoryRepository.findByProductId(productId).orElse(null);
        if (inventory == null) {
            return "Inventory not found";
        }
        inventory.setAverageDailyConsumption(consumption);
        inventoryRepository.saveAndFlush(inventory);
        return "Consumption rate updated";
    }
}

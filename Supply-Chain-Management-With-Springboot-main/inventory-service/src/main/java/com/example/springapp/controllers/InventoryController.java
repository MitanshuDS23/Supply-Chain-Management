package com.example.springapp.controllers;

import com.example.springapp.models.Inventory;
import com.example.springapp.service.InventoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class InventoryController {

    @Autowired
    InventoryService inventoryService;

    @PostMapping
    public String createInventory(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        int reorderLevel = Integer.parseInt(request.get("reorderLevel").toString());
        int maxCapacity = Integer.parseInt(request.get("maxCapacity").toString());
        String location = request.getOrDefault("location", "Warehouse").toString();

        return inventoryService.createInventoryForProduct(productId, reorderLevel, maxCapacity, location);
    }

    @PostMapping("/api/inventory/create-from-product")
    public String createInventoryFromProduct(
            @RequestParam("productId") Long productId,
            @RequestParam("productName") String productName,
            @RequestParam("initialStock") Integer initialStock) {
        return inventoryService.createInventoryFromProduct(productId, productName, initialStock);
    }

    @PutMapping("/restock/{productId}")
    public String restockProduct(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request) {
        int quantity = Integer.parseInt(request.get("quantity").toString());
        String performedBy = request.getOrDefault("performedBy", "system").toString();

        return inventoryService.restockProduct(productId, quantity, performedBy);
    }

    @PutMapping("/reduce/{productId}")
    public String reduceStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request) {
        int quantity = Integer.parseInt(request.get("quantity").toString());
        String performedBy = request.getOrDefault("performedBy", "system").toString();

        return inventoryService.reduceStock(productId, quantity, performedBy);
    }

    @GetMapping("/{productId}")
    public Inventory getInventory(@PathVariable Long productId) {
        return inventoryService.getInventoryByProductId(productId);
    }

    @GetMapping
    public List<Inventory> getAllInventory(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return inventoryService.getAllInventory(pageNo, pageSize);
    }

    @GetMapping("/low-stock")
    public List<Inventory> getLowStockItems() {
        return inventoryService.getLowStockItems();
    }

    @PutMapping("/reorder-level/{productId}")
    public String updateReorderLevel(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request) {
        int newReorderLevel = Integer.parseInt(request.get("reorderLevel").toString());
        return inventoryService.updateReorderLevel(productId, newReorderLevel);
    }

    @PutMapping("/consumption/{productId}")
    public String updateConsumption(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request) {
        Double consumption = Double.parseDouble(request.get("averageDailyConsumption").toString());
        return inventoryService.updateAverageDailyConsumption(productId, consumption);
    }
}

package com.example.springapp.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @PutMapping("/inventory/reduce/{productId}")
    String reduceStock(
            @PathVariable("productId") Long productId,
            @RequestBody Map<String, Object> request);
}

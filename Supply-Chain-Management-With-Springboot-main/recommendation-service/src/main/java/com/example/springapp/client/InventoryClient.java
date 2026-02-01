package com.example.springapp.client;

import com.example.springapp.dto.InventoryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @GetMapping("/inventory")
    List<InventoryDTO> getAllInventory(@RequestParam("pageNo") int pageNo, @RequestParam("pageSize") int pageSize);

    @GetMapping("/inventory/{productId}")
    InventoryDTO getInventoryByProductId(@PathVariable("productId") Long productId);
}

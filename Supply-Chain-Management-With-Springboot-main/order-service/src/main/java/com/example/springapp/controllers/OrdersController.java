package com.example.springapp.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.models.Orders;
import com.example.springapp.service.OrdersService;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class OrdersController {

    private static final Logger logger = LoggerFactory.getLogger(OrdersController.class);

    @Autowired
    OrdersService ordersService;

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody Orders order) {
        try {
            if (order == null) {
                logger.warn("Attempt to place order with null data");
                return buildErrorResponse("Order data is required", HttpStatus.BAD_REQUEST);
            }

            String result = ordersService.placeOrder(order);
            logger.info("Order placed successfully");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            response.put("order", order);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Error placing order", e);
            return buildErrorResponse("Failed to place order: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "50") int pageSize) {
        try {
            Page<Orders> orders = ordersService.getAllOrders(pageNo, pageSize);
            logger.info("Retrieved {} orders", orders.getTotalElements());
            return ResponseEntity.ok(orders);
            
        } catch (Exception e) {
            logger.error("Error retrieving orders", e);
            return buildErrorResponse("Failed to retrieve orders", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "50") int pageSize) {
        try {
            List<Orders> orders = ordersService.getOrderByStatus(status, pageNo, pageSize);
            logger.info("Retrieved {} orders with status: {}", orders.size(), status);
            return ResponseEntity.ok(orders);
            
        } catch (Exception e) {
            logger.error("Error retrieving orders by status: {}", status, e);
            return buildErrorResponse("Failed to retrieve orders", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable int id) {
        try {
            Orders order = ordersService.getOrderById(id);
            
            if (order == null) {
                return buildErrorResponse("Order not found", HttpStatus.NOT_FOUND);
            }
            
            return ResponseEntity.ok(order);
            
        } catch (Exception e) {
            logger.error("Error retrieving order: {}", id, e);
            return buildErrorResponse("Failed to retrieve order", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptOrder(@PathVariable int id) {
        try {
            String result = ordersService.acceptOrder(id);
            logger.info("Order {} accepted", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error accepting order: {}", id, e);
            return buildErrorResponse("Failed to accept order", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<?> deliverOrder(@PathVariable int id) {
        try {
            String result = ordersService.deliveredOrder(id);
            logger.info("Order {} marked as delivered", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error delivering order: {}", id, e);
            return buildErrorResponse("Failed to deliver order", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/transfer/{deliveryBoyId}")
    public ResponseEntity<?> transferOrder(@PathVariable int id, @PathVariable String deliveryBoyId) {
        try {
            String result = ordersService.transferOrder(id, deliveryBoyId);
            logger.info("Order {} transferred to delivery boy: {}", id, deliveryBoyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error transferring order: {}", id, e);
            return buildErrorResponse("Failed to transfer order", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable int id) {
        try {
            String result = ordersService.deleteOrder(id);
            logger.info("Order {} deleted", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error deleting order: {}", id, e);
            return buildErrorResponse("Failed to delete order", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<?> buildErrorResponse(String message, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}

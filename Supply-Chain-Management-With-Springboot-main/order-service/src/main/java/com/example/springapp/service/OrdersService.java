package com.example.springapp.service;

import com.example.springapp.events.OrderEvent;
import com.example.springapp.events.OrderEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import com.example.springapp.models.Orders;
import com.example.springapp.repositories.OrdersRepo;

@Service
public class OrdersService {

    @Autowired
    OrdersRepo ordersRepo;

    @Autowired
    com.example.springapp.repositories.OrderItemRepository orderItemRepo;

    @Autowired
    com.example.springapp.client.InventoryClient inventoryClient;

    @Autowired
    OrderEventPublisher orderEventPublisher;

    @org.springframework.transaction.annotation.Transactional
    public String placeOrder(Orders order) {
        order.setStatus("Placed");
        Orders savedOrder = ordersRepo.save(order);

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (com.example.springapp.models.OrderItem item : order.getItems()) {
                item.setOrderId(savedOrder.getId());
                orderItemRepo.save(item);

                // Reduce inventory
                if (item.getProductId() != null && item.getQuantity() != null) {
                    try {
                        java.util.Map<String, Object> request = new java.util.HashMap<>();
                        request.put("quantity", item.getQuantity());
                        request.put("performedBy", "Order #" + savedOrder.getId());
                        inventoryClient.reduceStock(item.getProductId(), request);
                    } catch (Exception e) {
                        System.err.println("Failed to reduce stock: " + e.getMessage());
                    }
                }
            }
        }

        // Publish order created event
        OrderEvent event = new OrderEvent(
                OrderEvent.EventType.CREATED,
                (long) savedOrder.getId(),
                null, // will be set per item if needed
                savedOrder.getItems() != null ? savedOrder.getItems().size() : 0,
                savedOrder.getTotalAmount(),
                LocalDateTime.now());
        orderEventPublisher.publishOrderEvent(event);

        return "Order placed with order id " + savedOrder.getId();
    }

    public String acceptOrder(int id) {
        Orders order = ordersRepo.findById(id).orElse(null);
        if (order == null) {
            return "Order not found";
        }
        order.setStatus("Accepted");
        ordersRepo.saveAndFlush(order);

        // Publish order confirmed event
        OrderEvent event = new OrderEvent(
                OrderEvent.EventType.CONFIRMED,
                (long) order.getId(),
                null,
                order.getItems() != null ? order.getItems().size() : 0,
                order.getTotalAmount(),
                LocalDateTime.now());
        orderEventPublisher.publishOrderEvent(event);

        return "Order " + id + " Accepted";
    }

    public String transferOrder(int id, String deliveryBoyId) {
        Orders order = ordersRepo.findById(id).orElse(null);
        if (order == null) {
            return "Order not found";
        }
        order.setStatus("Transferred");
        order.setDeliveryboyid(deliveryBoyId);
        ordersRepo.saveAndFlush(order);
        return "Order " + id + " transfered";
    }

    public String deliveredOrder(int id) {
        Orders order = ordersRepo.findById(id).orElse(null);
        if (order == null) {
            return "Order not found";
        }
        order.setStatus("Delivered");
        ordersRepo.saveAndFlush(order);
        return "Order " + id + " delivered";
    }

    public String deleteOrder(int id) {
        Orders order = ordersRepo.findById(id).orElse(null);
        if (order == null) {
            return "Order not found";
        }

        try {
            ordersRepo.deleteById(id);

            // Publish order cancelled event
            OrderEvent event = new OrderEvent(
                    OrderEvent.EventType.CANCELLED,
                    (long) id,
                    null,
                    order.getItems() != null ? order.getItems().size() : 0,
                    order.getTotalAmount(),
                    LocalDateTime.now());
            orderEventPublisher.publishOrderEvent(event);
        } catch (Exception e) {
            return "Order not found";
        }
        return "Order " + id + " deleted";
    }

    public Page<Orders> getAllOrders(int pageNumber, int pageSize) {
        Pageable paging = PageRequest.of(pageNumber, pageSize);
        return ordersRepo.findAll(paging);
    }

    public Orders getOrderById(int id) {
        Orders order = ordersRepo.findById(id).orElse(null);
        if (order == null) {
            order = new Orders();
            order.setId(-1);
            order.setStatus("Order not found");
        }
        return order;
    }

    public List<Orders> getOrderByStatus(String status, int pageNumber, int pageSize) {
        Pageable paging = PageRequest.of(pageNumber, pageSize);
        return ordersRepo.findByStatus(status, paging).getContent();
    }
}
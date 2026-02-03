package com.example.springapp.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {

    private EventType eventType;
    private Long orderId;
    private Long productId;
    private Integer quantity;
    private Double totalAmount;
    private LocalDateTime timestamp;

    public enum EventType {
        CREATED,
        CONFIRMED,
        CANCELLED
    }
}

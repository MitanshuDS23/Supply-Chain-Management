package com.example.springapp.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEvent {

    private EventType eventType;
    private Long productId;
    private Integer quantity;
    private Integer threshold;
    private LocalDateTime timestamp;

    public enum EventType {
        STOCK_UPDATED,
        LOW_STOCK_ALERT
    }
}

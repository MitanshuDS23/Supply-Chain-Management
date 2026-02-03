package com.example.springapp.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductEvent {

    private EventType eventType;
    private Long productId;
    private String name;
    private String category;
    private Double price;
    private LocalDateTime timestamp;

    public enum EventType {
        CREATED,
        UPDATED,
        DELETED
    }
}

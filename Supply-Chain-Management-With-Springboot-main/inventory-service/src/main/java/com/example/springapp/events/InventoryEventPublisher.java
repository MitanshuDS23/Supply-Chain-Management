package com.example.springapp.events;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class InventoryEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.inventory-events}")
    private String inventoryEventsTopic;

    public InventoryEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishInventoryEvent(InventoryEvent event) {
        try {
            log.info("Publishing inventory event: {} for product ID: {}", event.getEventType(), event.getProductId());
            kafkaTemplate.send(inventoryEventsTopic, event.getProductId().toString(), event);
            log.info("Inventory event published successfully");
        } catch (Exception e) {
            log.error("Error publishing inventory event: {}", e.getMessage(), e);
        }
    }
}

package com.example.springapp.consumers;

import com.example.springapp.events.InventoryEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class InventoryEventConsumer {

    @KafkaListener(topics = "${kafka.topic.inventory-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeInventoryEvent(InventoryEvent event) {
        try {
            log.info("Received inventory event: {} for product ID: {}", event.getEventType(), event.getProductId());

            switch (event.getEventType()) {
                case LOW_STOCK_ALERT:
                    log.info("LOW STOCK ALERT for product ID: {} - Current quantity: {}, Threshold: {}",
                            event.getProductId(), event.getQuantity(), event.getThreshold());
                    // Generate restock recommendation
                    generateRestockRecommendation(event.getProductId(), event.getQuantity(), event.getThreshold());
                    break;
                case STOCK_UPDATED:
                    log.info("Stock updated for product ID: {} - New quantity: {}",
                            event.getProductId(), event.getQuantity());
                    // Track stock changes for recommendation analysis
                    break;
            }
        } catch (Exception e) {
            log.error("Error processing inventory event: {}", e.getMessage(), e);
        }
    }

    private void generateRestockRecommendation(Long productId, Integer currentQuantity, Integer threshold) {
        // Calculate recommended restock quantity (example: 2x threshold)
        int recommendedQuantity = threshold * 2;
        log.info("RECOMMENDATION: Restock product {} with {} units (current: {}, threshold: {})",
                productId, recommendedQuantity, currentQuantity, threshold);
        // In a real system, this would save to a database or send notifications
    }
}

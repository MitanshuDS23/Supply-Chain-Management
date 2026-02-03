package com.example.springapp.consumers;

import com.example.springapp.events.ProductEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ProductEventConsumer {

    @KafkaListener(topics = "${kafka.topic.product-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeProductEvent(ProductEvent event) {
        try {
            log.info("Received product event: {} for product ID: {}", event.getEventType(), event.getProductId());

            switch (event.getEventType()) {
                case CREATED:
                    log.info("Product created: {} - {}", event.getProductId(), event.getName());
                    // Inventory might auto-create a record or wait for explicit initialization
                    break;
                case UPDATED:
                    log.info("Product updated: {} - {}", event.getProductId(), event.getName());
                    // Update product details in inventory if needed
                    break;
                case DELETED:
                    log.info("Product deleted: {}", event.getProductId());
                    // Handle product deletion in inventory
                    break;
            }
        } catch (Exception e) {
            log.error("Error processing product event: {}", e.getMessage(), e);
        }
    }
}

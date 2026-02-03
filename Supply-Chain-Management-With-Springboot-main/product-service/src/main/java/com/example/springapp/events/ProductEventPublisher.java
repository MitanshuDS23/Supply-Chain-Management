package com.example.springapp.events;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ProductEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.product-events}")
    private String productEventsTopic;

    public ProductEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishProductEvent(ProductEvent event) {
        try {
            log.info("Publishing product event: {} for product ID: {}", event.getEventType(), event.getProductId());
            kafkaTemplate.send(productEventsTopic, event.getProductId().toString(), event);
            log.info("Product event published successfully");
        } catch (Exception e) {
            log.error("Error publishing product event: {}", e.getMessage(), e);
        }
    }
}

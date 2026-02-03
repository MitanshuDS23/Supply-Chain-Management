package com.example.springapp.events;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.order-events}")
    private String orderEventsTopic;

    public OrderEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderEvent(OrderEvent event) {
        try {
            log.info("Publishing order event: {} for order ID: {}", event.getEventType(), event.getOrderId());
            kafkaTemplate.send(orderEventsTopic, event.getOrderId().toString(), event);
            log.info("Order event published successfully");
        } catch (Exception e) {
            log.error("Error publishing order event: {}", e.getMessage(), e);
        }
    }
}

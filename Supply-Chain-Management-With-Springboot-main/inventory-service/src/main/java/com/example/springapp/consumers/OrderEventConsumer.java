package com.example.springapp.consumers;

import com.example.springapp.events.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OrderEventConsumer {

    @KafkaListener(topics = "${kafka.topic.order-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeOrderEvent(OrderEvent event) {
        try {
            log.info("Received order event: {} for order ID: {}", event.getEventType(), event.getOrderId());

            switch (event.getEventType()) {
                case CREATED:
                    log.info("Order created: {} - Quantity: {}", event.getOrderId(), event.getQuantity());
                    // Inventory stock reduction is already handled by REST API call in OrderService
                    // This is for tracking/auditing purposes
                    break;
                case CONFIRMED:
                    log.info("Order confirmed: {}", event.getOrderId());
                    // Additional processing if needed
                    break;
                case CANCELLED:
                    log.info("Order cancelled: {}", event.getOrderId());
                    // Potentially restore inventory if needed
                    break;
            }
        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage(), e);
        }
    }
}

package com.example.springapp.consumers;

import com.example.springapp.events.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class OrderEventConsumer {

    // Simple in-memory tracking of popular products
    private final Map<Long, Integer> productOrderCount = new HashMap<>();

    @KafkaListener(topics = "${kafka.topic.order-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeOrderEvent(OrderEvent event) {
        try {
            log.info("Received order event: {} for order ID: {}", event.getEventType(), event.getOrderId());

            switch (event.getEventType()) {
                case CREATED:
                    log.info("Order created with {} items - Total: ${}",
                            event.getQuantity(), event.getTotalAmount());
                    // Track product popularity for recommendations
                    if (event.getProductId() != null) {
                        trackProductPopularity(event.getProductId(), event.getQuantity());
                    }
                    break;
                case CONFIRMED:
                    log.info("Order confirmed: {}", event.getOrderId());
                    break;
                case CANCELLED:
                    log.info("Order cancelled: {}", event.getOrderId());
                    break;
            }
        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage(), e);
        }
    }

    private void trackProductPopularity(Long productId, Integer quantity) {
        productOrderCount.merge(productId, quantity, Integer::sum);
        log.info("Product {} popularity updated - Total orders: {}",
                productId, productOrderCount.get(productId));
        // In a real system, this would be persisted and used for ML-based
        // recommendations
    }
}

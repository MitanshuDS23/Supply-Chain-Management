package com.example.springapp.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class RedisConfig {
    // Basic configuration to enable caching.
    // Spring Boot auto-configuration handles RedisConnectionFactory and
    // RedisTemplate/CacheManager defaults.
}

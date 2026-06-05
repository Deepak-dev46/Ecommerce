package com.relevantz.ticketservice.client;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RmoFeignConfig {

    @Bean
    public RequestInterceptor rmoInterServiceInterceptor() {
        return template -> {
            template.header("X-User-Email", "system@internal");
            template.header("X-User-Id", "0");
            template.header("X-User-Roles", "SYSTEM");
        };
    }
}

package com.rvz.emailticketservice.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Passes system headers so RMO @PreAuthorize("hasAuthority('RMO')") allows the call. */
@Configuration
public class RmoFeignConfig {
    @Bean
    public RequestInterceptor rmoSystemHeaders() {
        return template -> {
            template.header("X-User-Email", "system@internal");
            template.header("X-User-Id",    "0");
            template.header("X-User-Roles", "RMO");
        };
    }
}
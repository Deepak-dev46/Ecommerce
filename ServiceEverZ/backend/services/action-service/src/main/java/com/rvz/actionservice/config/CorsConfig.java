package com.rvz.actionservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Centralised CORS configuration.
 * This is the single source of CORS rules — no @CrossOrigin annotations
 * are used on controllers so there is no conflict with allowCredentials=true.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow React dev server
        config.addAllowedOrigin("http://localhost:5173");

        // Allow all standard headers
        config.addAllowedHeader("*");

        // Allow all HTTP methods including OPTIONS (preflight)
        config.addAllowedMethod("*");

        // Allow cookies / auth headers
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}

package com.rvz.serviceeverz.knowledgebase.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration for knowledgebase-service (servlet / Spring MVC).
 *
 * FIX 1: Package changed from com.serviceeverz.apigateway.config
 *         to com.rvz.serviceeverz.knowledgebase.config so that
 *         @SpringBootApplication component-scan actually finds this class.
 *
 * FIX 2: Replaced reactive CorsWebFilter + reactive UrlBasedCorsConfigurationSource
 *         with WebMvcConfigurer#addCorsMappings(). The reactive classes only work
 *         with spring-boot-starter-webflux (Netty); this service uses
 *         spring-boot-starter-web (Tomcat/servlet), so the reactive bean was
 *         silently ignored and CORS headers were never sent.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

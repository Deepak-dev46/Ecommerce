package com.rvz.serviceeverz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration for problem-service (servlet / Spring MVC).
 *
 * FIX 1: Package changed from com.serviceeverz.apigateway.config
 *         to com.rvz.serviceeverz.config so @SpringBootApplication scan picks it up.
 *
 * FIX 2: Class renamed from GatewayCorsConfig to CorsConfig — the filename is
 *         CorsConfig.java, so the class name must match or the compiler rejects it.
 *
 * FIX 3: Replaced reactive CorsWebFilter + reactive UrlBasedCorsConfigurationSource
 *         with WebMvcConfigurer#addCorsMappings(). Reactive beans are ignored in
 *         a servlet/Tomcat application; CORS was never applied.
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

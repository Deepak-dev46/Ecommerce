package com.rvz.slaservice.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

 @Bean
 public CorsFilter corsFilter() {
     CorsConfiguration config = new CorsConfiguration();

     // Allow your React dev server
     config.addAllowedOrigin("http://localhost:3000");

     // Allow all standard headers
     config.addAllowedHeader("*");

     // Allow all HTTP methods including OPTIONS (preflight)
     config.addAllowedMethod("*");

     // Allow cookies/auth headers if needed
     config.setAllowCredentials(true);

     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
     source.registerCorsConfiguration("/**", config);   // applies to ALL endpoints

     return new CorsFilter(source);
 }
}


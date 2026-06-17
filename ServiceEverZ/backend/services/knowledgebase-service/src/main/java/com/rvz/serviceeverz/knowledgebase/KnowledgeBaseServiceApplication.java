package com.rvz.serviceeverz.knowledgebase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
 
@SpringBootApplication
@EnableFeignClients
public class KnowledgeBaseServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(KnowledgeBaseServiceApplication.class, args);
    }
}
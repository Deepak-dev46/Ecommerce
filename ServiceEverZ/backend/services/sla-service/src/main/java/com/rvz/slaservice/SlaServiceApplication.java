package com.rvz.slaservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SlaServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SlaServiceApplication.class, args);
    }
}

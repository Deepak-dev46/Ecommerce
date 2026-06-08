package com.serviceeverz.rmoservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RmoServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(RmoServiceApplication.class, args);
    }
}
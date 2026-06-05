package com.rvz.actionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ActionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ActionServiceApplication.class, args);
    }
}

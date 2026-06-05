package com.rvz.serviceeverz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ChangeManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChangeManagementApplication.class, args);
    }
}

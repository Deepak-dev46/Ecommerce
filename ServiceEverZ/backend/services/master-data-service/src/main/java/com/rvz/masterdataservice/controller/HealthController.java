package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins="http://localhost:5173/")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        ApiResponse<String> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Master Data Service is running");
        response.setData("UP");
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}

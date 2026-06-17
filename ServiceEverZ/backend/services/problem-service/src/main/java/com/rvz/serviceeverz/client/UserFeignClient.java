package com.rvz.serviceeverz.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rvz.serviceeverz.dto.response.ApiResponse;

//UserFeignClient.java
@FeignClient(name = "user-service", url = "${user.service.url}")
public interface UserFeignClient {

	@GetMapping("/api/users/{userId}/email")
	ApiResponse<String> getUserEmail(@PathVariable("userId") Long userId);

	@GetMapping("/api/users/{userId}/name")
	ApiResponse<String> getUserName(@PathVariable("userId") Long userId);

	@GetMapping("/api/users/{userId}/manager-id")
	ApiResponse<Long> getManagerId(@PathVariable("userId") Long userId);
}

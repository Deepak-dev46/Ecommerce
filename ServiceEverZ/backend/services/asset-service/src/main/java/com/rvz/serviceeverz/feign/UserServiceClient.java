package com.rvz.serviceeverz.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rvz.serviceeverz.dto.response.UserSummaryResponse;

@FeignClient(name = "ums-service", url = "${ums.service.url}")
public interface UserServiceClient {

    @GetMapping("/api/v1/admin/users/{id}")
    UserSummaryResponse getUserById(@PathVariable("id") Long id);
}

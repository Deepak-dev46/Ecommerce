package com.rvz.approvalservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "sla-service", url = "${sla.service.base-url}")
public interface SlaClient {

    @PostMapping("/start")
    Object startSla(@RequestBody Map<String, Object> request);
}

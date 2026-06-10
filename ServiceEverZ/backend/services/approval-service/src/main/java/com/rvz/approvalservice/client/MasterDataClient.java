package com.rvz.approvalservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "master-data-service", url = "${master.service.url}")
public interface MasterDataClient {

    @GetMapping("/api/master/projects/{projectId}")
    Map<String, Object> getProjectById(@PathVariable("projectId") Long projectId);

    @GetMapping("/api/master/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}

package com.relevantz.ticketservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@FeignClient(name = "master-data-service", url = "${master.service.url}")
public interface MasterDataClient {

    @GetMapping("/api/master/projects/{projectId}")
    Map<String, Object> getProjectById(@PathVariable("projectId") Long projectId);

    @GetMapping("/api/master/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);

    @GetMapping("/api/master/users")
    Map<String, Object> getUsers(@RequestParam(value = "status", required = false) String status);

    @GetMapping("/api/master/categories/{categoryId}")
    Map<String, Object> getCategoryById(@PathVariable("categoryId") Integer categoryId);

    @GetMapping("/api/master/subcategories/{subcategoryId}")
    Map<String, Object> getSubcategoryById(@PathVariable("subcategoryId") Integer subcategoryId);

    @GetMapping("/api/master/items/{itemId}")
    Map<String, Object> getItemById(@PathVariable("itemId") Integer itemId);

    @GetMapping("/api/master/priority-sla/{priorityId}")
    Map<String, Object> getPriorityById(@PathVariable("priorityId") Integer priorityId);
}

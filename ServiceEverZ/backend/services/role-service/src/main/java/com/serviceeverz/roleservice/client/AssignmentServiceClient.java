package com.serviceeverz.roleservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * NEW FILE — role-service/src/main/java/com/serviceeverz/roleservice/client/AssignmentServiceClient.java
 *
 * Called by UserRoleMappingServiceImpl when SUPPORT_PERSONNEL role is assigned,
 * to automatically create the capacity entry in assignment-service.
 */
@FeignClient(name = "assignment-service")
public interface AssignmentServiceClient {

    @PostMapping("/api/assignments/capacity/add")
    void addSupportPersonnelCapacity(@RequestBody Map<String, Object> body);
}

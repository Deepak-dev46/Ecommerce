package com.rvz.approvalservice.client;

import com.rvz.approvalservice.dto.request.AssignmentTriggerRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "assignment-service", url = "${assignment.service.base-url}")
public interface AssignmentClient {

    @PostMapping("/trigger")
    Object triggerAssignment(@RequestBody AssignmentTriggerRequest request);
}

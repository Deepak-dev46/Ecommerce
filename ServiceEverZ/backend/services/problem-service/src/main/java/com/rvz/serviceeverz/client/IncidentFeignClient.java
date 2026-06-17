package com.rvz.serviceeverz.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.rvz.serviceeverz.dto.response.ApiResponse;

//IncidentFeignClient.java
@FeignClient(name = "incident-service", url = "${incident.service.url}")

public interface IncidentFeignClient {

	@GetMapping("/api/incidents/{id}/title")
	ApiResponse<String> getIncidentTitle(@PathVariable("id") Long incidentId);

	@GetMapping("/api/incidents/{id}/reporter-id")
	ApiResponse<Long> getIncidentReporterId(@PathVariable("id") Long incidentId);

	@GetMapping("/api/incidents/{id}")
	ApiResponse<Object> getIncidentById(@PathVariable("id") Long incidentId);

	@PutMapping("/api/incidents/{id}/status")
	ApiResponse<Object> updateIncidentStatus(@PathVariable("id") Long incidentId,
			@RequestParam("status") String status);
}

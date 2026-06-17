package com.serviceeverz.userservice.location.controller;

import com.serviceeverz.userservice.location.dto.CreateLocationRequest;
import com.serviceeverz.userservice.location.dto.LocationResponse;
import com.serviceeverz.userservice.location.dto.MapUserLocationRequest;
import com.serviceeverz.userservice.location.dto.UpdateLocationRequest;
import com.serviceeverz.userservice.location.service.ILocationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/locations")
public class LocationController {

    private final ILocationService service;

    public LocationController(ILocationService service) {
        this.service = service;
    }

    // Create a new location
    @PostMapping
    public ResponseEntity<LocationResponse> create(@Valid @RequestBody CreateLocationRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    // Get all locations — supports optional ?search= query param
    @GetMapping
    public ResponseEntity<List<LocationResponse>> getAll(
            @RequestParam(required = false, defaultValue = "") String search
    ) {
        return ResponseEntity.ok(service.getAll(search));
    }

    // Assign a location to a specific user
    @PutMapping("/users/{userId}/location")
    public ResponseEntity<Void> assignToUser(
            @PathVariable Long userId,
            @Valid @RequestBody MapUserLocationRequest request
    ) {
        service.assignLocationToUser(userId, request);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<LocationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLocationRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
     
        service.delete(id);
     
        return ResponseEntity.noContent().build();
    }
     
     
}
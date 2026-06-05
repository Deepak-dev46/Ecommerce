package com.serviceeverz.userservice.location.dto;

import com.serviceeverz.userservice.location.entity.Location;

import java.time.LocalDateTime;

public class LocationResponse {
    public Long id;
    public String name;
    public boolean active;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public static LocationResponse from(Location location) {
        LocationResponse r = new LocationResponse();
        r.id = location.getId();
        r.name = location.getName();
        r.active = location.isActive();
        r.createdAt = location.getCreatedAt();
        r.updatedAt = location.getUpdatedAt();
        return r;
    }
}
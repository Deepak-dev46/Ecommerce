package com.serviceeverz.userservice.location.dto;

import jakarta.validation.constraints.NotNull;

public class MapUserLocationRequest {

    @NotNull
    private Long locationId;

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
}